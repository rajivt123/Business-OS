import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function uuidLike(v: unknown): boolean {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[×*]/g, "X")
    .replace(/[–—−]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\bNB\.?\b/g, " NB ")
    .replace(/\bNOMINAL\s*BORE\b/g, " NB ")
    .replace(/\bNO\.?\s*OF\b/g, " NUMBER ")
    .replace(/[^A-Z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(value.split(" ").filter((x) => x.length > 1));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

function attributeScore(input: Record<string, unknown>, item: Record<string, unknown>): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let matched = 0;
  let considered = 0;
  const attrs = (item.identity_attributes && typeof item.identity_attributes === "object")
    ? item.identity_attributes as Record<string, unknown>
    : {};

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === "") continue;
    considered++;
    const iv = attrs[key];
    if (iv === undefined || iv === null || iv === "") continue;
    if (normalizeText(String(iv)) === normalizeText(String(value))) {
      matched++;
      reasons.push(`${key} matches`);
    }
  }

  return { score: considered ? matched / considered : 0, reasons };
}

async function authenticate(req: Request) {
  const header = req.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("Missing authorization");
  const token = header.slice(7).trim();
  const { data, error } = await admin.auth.getClaims(token);
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !uuidLike(sub)) {
    throw new Error("Invalid or expired session");
  }
  return { id: sub };
}

async function companyAccess(userId: string, tenantCompanyId: string) {
  if (!uuidLike(tenantCompanyId)) throw new Error("Invalid tenant_company_id format");

  const { data: opco, error: opcoErr } = await admin
    .from("tenant_companies")
    .select("tenant_id,status")
    .eq("id", tenantCompanyId)
    .maybeSingle();

  if (opcoErr || !opco?.tenant_id || opco.status !== "active") {
    throw new Error("Tenant company not found or inactive");
  }

  const { data: memberships, error: memErr } = await admin
    .from("tenant_memberships")
    .select("id,role,status")
    .eq("tenant_id", opco.tenant_id)
    .eq("user_id", userId)
    .eq("status", "active");

  if (memErr || !memberships?.length) {
    throw new Error("Active tenant membership required");
  }

  for (const member of memberships) {
    const role = String(member.role || "").toUpperCase();
    if (role === "OWNER" || role === "ADMIN") {
      return { tenantId: opco.tenant_id, role };
    }

    const { data: access, error: accessErr } = await admin
      .from("user_company_access")
      .select("can_view,can_edit")
      .eq("membership_id", member.id)
      .eq("tenant_company_id", tenantCompanyId)
      .maybeSingle();

    if (accessErr) throw new Error("Unable to verify company access");
    if (access?.can_view || access?.can_edit) {
      return { tenantId: opco.tenant_id, role };
    }
  }

  throw new Error("User does not have access to this operating company");
}

async function loadRules(domainCode: string | null) {
  let query = admin
    .from("mep_normalization_rules")
    .select("id,domain_code,rule_code,rule_type,pattern,replacement,priority,applies_to,is_active")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (domainCode) {
    query = query.or(`domain_code.is.null,domain_code.eq.${domainCode}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load normalization rules: ${error.message}`);
  return data || [];
}

function applyRules(text: string, rules: any[]): string {
  let result = text;
  for (const rule of rules) {
    if (rule.applies_to && rule.applies_to !== "description") continue;
    try {
      if (rule.rule_type === "replace" || rule.rule_type === "regex") {
        result = result.replace(new RegExp(rule.pattern, "gi"), rule.replacement ?? "");
      } else if (rule.rule_type === "literal") {
        result = result.split(String(rule.pattern)).join(String(rule.replacement ?? ""));
      }
    } catch {
      // Invalid stored rule must not break identification.
    }
  }
  return normalizeText(result);
}

function normalizeUom(value: unknown): string | null {
  const v = normalizeText(value);
  const map: Record<string, string> = {
    NOS: "NOS", NO: "NOS", PCS: "NOS", PC: "NOS", EACH: "NOS", EA: "NOS", SET: "SET", SETS: "SET",
    M: "MTR", MTR: "MTR", METER: "MTR", METRE: "MTR", RM: "MTR", RMT: "MTR",
    MM: "MM", CM: "CM", FT: "FT", FOOT: "FT", FEET: "FT", IN: "IN", INCH: "IN", INCHES: "IN",
    KG: "KG", KGS: "KG", KILOGRAM: "KG", MT: "MT", TON: "MT", TONNE: "MT",
    LTR: "LTR", L: "LTR", LITRE: "LTR", LITER: "LTR",
    SQM: "SQM", M2: "SQM", SQMT: "SQM", SQMTR: "SQM", "M²": "SQM", SQFT: "SQFT", FT2: "SQFT", "FT²": "SQFT",
    LOT: "LOT", JOB: "JOB"
  };
  return map[v] || null;
}

// Strip commercial scope prefixes ("Supply, Installation, Testing...", "Providing & fixing...", "SITC of...", etc.)
function stripCommercialScope(text: string): { productText: string; scopeText: string } {
  let raw = String(text || "").trim();
  if (!raw) return { productText: "", scopeText: "" };

  const prefixRegex = /^\s*(?:(?:SUPPLY(?:ING)?|INSTALLATION|INSTALLING|PROVIDING|FIXING|TESTING|COMMISSIONING|ERECTION|FABRICATION|LAYING|JOINTING|P\s*&\s*F|SITC(?:\s+OF)?)\s*(?:,|AND|\/|&)?\s*)+(?:OF\s+)?/i;
  const prefixMatch = raw.match(prefixRegex);
  let scope = prefixMatch ? prefixMatch[0].trim() : "";
  let prod = raw.replace(prefixRegex, "").trim();

  // Split out auxiliary commercial clauses (e.g. "including supply of paint and painting...", "complete as per...")
  const auxSplit = prod.split(/\b(?:INCLUDING(?:\s+SUPPLY\s+OF)?|COMPLETE\s+WITH|COMPLETE\s+AS\s+PER|ALONG\s+WITH|TOGETHER\s+WITH|AS\s+PER\s+THE\s+DIRECTION\s+OF|PRICE\s+(?:SHALL|IS)|WHEREVER\s+REQUIRED)\b/i);
  if (auxSplit.length > 1) {
    prod = auxSplit[0].trim();
    scope = [scope, auxSplit.slice(1).join(" ")].filter(Boolean).join(" | ");
  }

  return { productText: prod || raw, scopeText: scope };
}

function compactParent(value: unknown): string {
  const { productText } = stripCommercialScope(String(value || ""));
  return productText.replace(/\s+/g, " ").trim();
}

function dimensionFromText(value: string): string | null {
  const m = value.match(/\b(\d{1,4}(?:\.\d+)?)\s*(?:MM|M\.M\.?|NB)\b/i);
  if (m) return String(Math.round(Number(m[1])));
  // Inch dimensions to mm (e.g. 6", 4", 2-1/2", 1/2")
  const inchMatch = value.match(/\b(1\/2|3\/4|1|1\s*1\/4|1\s*1\/2|2|2\s*1\/2|3|4|5|6|8|10|12)\s*(?:INCH|IN|\"|'')\b/i);
  if (inchMatch) {
    const inchMap: Record<string, string> = {
      "1/2": "15", "3/4": "20", "1": "25", "1 1/4": "32", "1 1/2": "40",
      "2": "50", "2 1/2": "65", "3": "80", "4": "100", "5": "125",
      "6": "150", "8": "200", "10": "250", "12": "300"
    };
    const key = inchMatch[1].replace(/\s+/g, " ").trim();
    if (inchMap[key]) return inchMap[key];
  }
  return null;
}

function isDimensionOnly(text: string): boolean {
  const norm = normalizeText(text);
  return /^(\d{1,4}(?:\.\d+)?)\s*(?:MM|NB)?(?:\s*NOMINAL)?(?:\s*(?:DIA|DIAMETER|BORE))?$/.test(norm) ||
         /^(?:DIA(?:METER)?\s*)?(\d{1,4}(?:\.\d+)?)\s*(?:MM|NB)$/.test(norm);
}

function classifyItemType(text: string): "stock" | "service" | "asset" | "consumable" {
  const t = normalizeText(text);
  if (/INSTALLATION|TESTING|COMMISSIONING|LABOUR|SERVICE|ERECTION|FABRICATION/.test(t) &&
      !/PIPE|VALVE|SPRINKLER|HYDRANT|PUMP|TANK|NOZZLE|FITTING|HOSE|COUPLING|FLANGE|STRAINER|COATING/.test(t)) {
    return "service";
  }
  return "stock";
}

// GENERIC FIRE-FIGHTING CATEGORY CLASSIFICATION
// Primary product noun is resolved from the core product clause, avoiding misclassification from auxiliary painting/coating clauses.
function classifyCategory(text: string, categories: any[]): any | null {
  const { productText } = stripCommercialScope(text);
  const primary = normalizeText(productText);
  const full = normalizeText(text);

  let code: string | null = null;

  // 1. Valves
  if (/GATE VALVE|BUTTERFLY VALVE|CHECK VALVE|DUAL PLATE|NRV\b|DELUGE VALVE|ALARM VALVE|AIR RELEASE VALVE|SAFETY VALVE|DRAIN VALVE|BALL VALVE|PRV\b|PRESSURE REDUCING VALVE|FOOT VALVE|LANDING VALVE|\bVALVE\b/.test(primary)) {
    code = "VALVE";
  }
  // 2. Sprinklers
  else if (/SPRINKLER|UPRIGHT\s+K-|PENDENT\s+K-|K-\d+.*(?:UPRIGHT|PENDENT|SIDEWALL)|SIDEWALL\s+SPRINKLER|CONCEALED\s+SPRINKLER|\bK\s*[-.:]?\s*\d+\s*(?:UPRIGHT|PENDENT|SIDEWALL)/.test(primary) ||
           /SPRINKLER/.test(full)) {
    code = "SPRINKLER";
  }
  // 3. Strainers
  else if (/STRAINER|Y-STRAINER|POT STRAINER/.test(primary)) {
    code = "STRAINER";
  }
  // 4. Hydrant Equipment & Landing Valves
  else if (/HYDRANT|FIRE BRIGADE INLET|BREECHING|STAND PIPE/.test(primary)) {
    code = "HYDRANT";
  }
  // 5. Fire Hoses & Hose Reels
  else if (/HOSE REEL/.test(primary)) {
    code = "HOSE_REEL";
  } else if (/FIRE HOSE BOX|FIRE HOSE CABINET|HOSE CABINET/.test(primary)) {
    code = "HOSE_CABINET";
  } else if (/RRL HOSE|CANVAS HOSE|FIRE HOSE|DELIVERY HOSE/.test(primary)) {
    code = "HOSE";
  }
  // 6. Coating & Wrapping (When wrapping/coating is the primary product noun)
  else if (/WRAPPING\s*(?:&|AND)?\s*COATING|COATING\s*(?:&|AND)?\s*WRAPPING|COAL\s+TAR\s+TAPE|PYPKOTE|^(?:(?:EXTERNAL|INTERNAL|UNDERGROUND)\s+)?(?:WRAPPING|COATING)\b/.test(primary)) {
    code = "COATING";
  }
  // 7. Pipes (Crucial: Pipe checked for pipe noun; auxiliary paint clauses ignored)
  else if (/\bPIPE(?:S)?\b|PIPELINE|\bTUBES?\b|C\s+CLASS\s+PIPE|SCH\s*40\s+PIPE|ERW\s+PIPE|SEAMLESS\s+PIPE|GI\s+PIPE|DI\s+PIPE|MS\s+PIPE/.test(primary) || /\bPIPE(?:S)?\b/.test(full)) {
    code = "PIPE";
  }
  // 8. Flow Switch & Alarm Devices
  else if (/FLOW SWITCH|WATER FLOW DETECTOR/.test(primary)) {
    code = "FLOW_SWITCH";
  }
  // 9. Fire Pumps & Tanks
  else if (/PUMP|BOOSTER PUMP|JOCKEY PUMP|FIRE PUMP/.test(primary)) {
    code = "PUMP";
  } else if (/STORAGE TANK|FIRE WATER TANK|\bTANK\b/.test(primary)) {
    code = "TANK";
  }
  // 10. Pipe Supports, Hangers & Fasteners
  else if (/M\.S\. ANGLE|ANGLE AND CHANNEL SUPPORT|PIPE SUPPORT|CLEVIS HANGER|U-BOLT|HANGER/.test(primary)) {
    code = "SUPPORT";
  } else if (/ANCHOR BOLT|ANCHOR FASTENER|FASTENER/.test(primary)) {
    code = "ANCHOR";
  }
  // 11. Pipe Fittings & Couplings
  else if (/COUPLING|FLEXIBLE COUPLING|GROOVED COUPLING/.test(primary)) {
    code = "COUPLING";
  } else if (/ELBOW|TEE\b|REDUCER|FLANGE|UNION\b|BEND\b|FITTING/.test(primary)) {
    code = "FITTING";
  }
  // 12. Nozzles & Monitors
  else if (/WATER MONITOR|PORTABLE WATER MONITOR/.test(primary)) {
    code = "MONITOR";
  } else if (/NOZZLE|BRANCH PIPE/.test(primary)) {
    code = "NOZZLE";
  }
  // 13. Services
  else if (/INSTALLATION|ERECTION|FABRICATION|TESTING AND COMMISSIONING/.test(primary)) {
    code = "SERVICE";
  }

  if (!code) return null;
  const found = categories.find((c: any) => c.code === code);
  if (found) return found;

  const defaultNames: Record<string, string> = {
    PIPE: "Pipes", VALVE: "Valves", SPRINKLER: "Sprinklers", HYDRANT: "Hydrant Equipment",
    HOSE: "Fire Hoses", HOSE_REEL: "Hose Reels", HOSE_CABINET: "Fire Hose Cabinets",
    STRAINER: "Strainers", PUMP: "Fire Pumps", TANK: "Fire Water Tanks",
    COATING: "Pipe Coating and Wrapping", SUPPORT: "Pipe Supports", ANCHOR: "Anchors and Fasteners",
    COUPLING: "Couplings", FITTING: "Pipe Fittings", MONITOR: "Monitors",
    NOZZLE: "Nozzles", FLOW_SWITCH: "Flow Switches", SERVICE: "Fire Protection Services"
  };

  return { id: null, code, name: defaultNames[code] || code };
}

function sourceUomFromLine(line: any): string | null {
  const attrs = line?.parsed_attributes && typeof line.parsed_attributes === "object"
    ? line.parsed_attributes as Record<string, unknown> : {};
  return normalizeUom(line?.uom_code || line?.supply_uom_code || line?.installation_uom_code ||
    attrs.source_uom || attrs.uom_code || null);
}

function inferMaterial(text: string): string | null {
  const t = normalizeText(text);
  if (/\bD[. ]?I\b|DUCTILE IRON/.test(t)) return "DI";
  if (/\bG[. ]?I\b|GALVAN/.test(t)) return "GI";
  if (/\bM[. ]?S\b|MILD STEEL/.test(t)) return "MS";
  if (/\bS[. ]?S\b|STAINLESS STEEL|STAINLESS/.test(t)) return "SS";
  if (/\bC[. ]?I\b|CAST IRON/.test(t)) return "CI";
  if (/\bCS\b|CARBON STEEL/.test(t)) return "CS";
  if (/\bBRASS\b/.test(t)) return "BRASS";
  if (/\bGUNMETAL\b/.test(t)) return "GUNMETAL";
  return null;
}

function categoryCodeFromItem(item: any): string | null {
  const attrs = item?.identity_attributes && typeof item.identity_attributes === "object"
    ? item.identity_attributes as Record<string, unknown> : {};
  const explicit = String(attrs.category_code || "").toUpperCase().trim();
  if (explicit) return explicit;
  const category = String(item?.category || "").toUpperCase();
  const map: Record<string, string> = {
    PIPE: "PIPE", PIPES: "PIPE", VALVE: "VALVE", VALVES: "VALVE", "PIPE FITTINGS": "FITTING", FITTING: "FITTING",
    SPRINKLERS: "SPRINKLER", SPRINKLER: "SPRINKLER", "FIRE PUMPS": "PUMP", "FIRE WATER TANKS": "TANK",
    "HYDRANT EQUIPMENT": "HYDRANT", HYDRANT: "HYDRANT", "HOSE REELS": "HOSE_REEL", "HOSE REEL": "HOSE_REEL",
    "FIRE HOSE CABINETS": "HOSE_CABINET", "FIRE HOSE CABINET": "HOSE_CABINET", STRAINERS: "STRAINER",
    COUPLINGS: "COUPLING", "PIPE SUPPORTS": "SUPPORT", "ANCHORS AND FASTENERS": "ANCHOR",
    "CABLE TRAYS": "CABLE_TRAY", "PIPE COATING AND WRAPPING": "COATING", "ORIFICE EQUIPMENT": "ORIFICE",
    "FIRE SYSTEM ACCESSORIES": "ACCESSORY", "FIRE PROTECTION SERVICES": "SERVICE", "FIRE HOSES": "HOSE"
  };
  return map[category] || null;
}

function simpleHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}

// GENERIC FIRE FIGHTING TECHNICAL ATTRIBUTES EXTRACTOR
function extractDynamicTechnicalAttributes(contextText: string): Record<string, unknown> {
  const norm = normalizeText(contextText);
  const attrs: Record<string, unknown> = {};

  // Grade / Class
  const classMatch = norm.match(/\bCLASS\s*([A-C]|HEAVY|MEDIUM|LIGHT)\b/i) || norm.match(/\b([A-C])\s*CLASS\b/i);
  if (classMatch) attrs.grade_class = `CLASS ${classMatch[1].toUpperCase()}`;

  // Schedule
  const schMatch = norm.match(/\b(?:SCH(?:EDULE)?\s*[-.:]?\s*(\d+))\b/i);
  if (schMatch) attrs.schedule = `SCH ${schMatch[1]}`;

  // Thickness
  let explicitThick = norm.match(/\b(\d{1,2}\.\d{1,2})\s*MM\b/i) ||
                      norm.match(/\b(\d{1,2}(?:\.\d{1,2})?)\s*MM\s*(?:THK|THICK|THICKNESS)\b/i) ||
                      norm.match(/\b(?:THK|THICK|THICKNESS)\s*[:.-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:MM)?\b/i);

  if (!explicitThick) {
    // If text has an explicit NB dimension (e.g. 150 NB) and another standalone mm measurement (e.g. 8mm)
    const nbMatch = norm.match(/\b(\d{2,4})\s*NB\b/i);
    const mmMatch = norm.match(/\b(\d{1,2})\s*MM\b/i);
    if (nbMatch && mmMatch) {
      const val = Number(mmMatch[1]);
      if (val >= 2 && val <= 30 && val !== Number(nbMatch[1])) {
        explicitThick = mmMatch;
      }
    }
  }

  if (explicitThick) {
    const tVal = Number(explicitThick[1]);
    if (tVal > 0 && tVal <= 30) {
      attrs.thickness_mm = `${tVal}MM`;
    }
  }

  // Standards
  const isMatch = norm.match(/\b(IS\s*[-.:]?\s*\d+)\b/i);
  if (isMatch) attrs.standard = normalizeText(isMatch[1]);
  const bsMatch = norm.match(/\b(BS\s*[-.:]?\s*\d+)\b/i);
  if (bsMatch) attrs.standard = normalizeText(bsMatch[1]);
  const nfpaMatch = norm.match(/\b(NFPA\s*[-.:]?\s*\d+)\b/i);
  if (nfpaMatch) attrs.standard = normalizeText(nfpaMatch[1]);
  const astmMatch = norm.match(/\b(ASTM\s*[-.:]?\s*[A-Z0-9]+)\b/i);
  if (astmMatch) attrs.standard = normalizeText(astmMatch[1]);

  // Pressure rating
  const pnMatch = norm.match(/\b(?:PN\s*[-.:]?\s*(\d+))\b/i);
  if (pnMatch) attrs.pressure_rating = `PN ${pnMatch[1]}`;
  const classRatingMatch = norm.match(/\b(?:CLASS\s*[-.:]?\s*(125|150|250|300|600))\b/i);
  if (classRatingMatch) attrs.pressure_rating = `CLASS ${classRatingMatch[1]}`;
  const psiMatch = norm.match(/\b(\d{3})\s*PSI\b/i);
  if (psiMatch) attrs.pressure_rating = `${psiMatch[1]} PSI`;

  // Certification (check negative certification first to prevent false UL/FM match)
  if (/\b(?:NON\s*[- /]?\s*(?:UL|FM)|NOT\s+(?:UL|FM)|WITHOUT\s+(?:UL|FM))\b/i.test(norm) ||
      /\bNON\s*[- ]?CERTIFIED\b/i.test(norm)) {
    attrs.certification = "NON-UL/FM";
  } else if (/UL\s*(?:\/|&|AND)?\s*FM|UL\s+LISTED\s+(?:AND|&)\s+FM\s+APPROVED/i.test(norm)) {
    attrs.certification = "UL/FM";
  } else if (/UL\s+LISTED|\bUL\b/i.test(norm)) {
    attrs.certification = "UL";
  } else if (/FM\s+APPROVED|\bFM\b/i.test(norm)) {
    attrs.certification = "FM";
  }

  // Sprinkler attributes
  const kMatch = norm.match(/\bK\s*[-.:]?\s*(\d+(?:\.\d+)?)\b/i);
  if (kMatch) attrs.k_factor = `K${kMatch[1]}`;

  if (/UPRIGHT/.test(norm)) attrs.sprinkler_type = "UPRIGHT";
  else if (/PENDENT|PENDANT/.test(norm)) attrs.sprinkler_type = "PENDENT";
  else if (/SIDEWALL/.test(norm)) attrs.sprinkler_type = "SIDEWALL";
  else if (/CONCEALED/.test(norm)) attrs.sprinkler_type = "CONCEALED";

  const tempMatch = norm.match(/\b(57|68|79|93|141|182)\s*(?:°\s*C|DEG\s*C|C)\b/i);
  if (tempMatch) attrs.temperature_rating = `${tempMatch[1]}C`;

  // Spindle: Check NON-RISING before RISING to avoid substring capture
  if (/NON\s*[- ]?RISING\s+SPINDLE|NRS\b/.test(norm)) {
    attrs.valve_spindle = "NON-RISING SPINDLE";
  } else if (/RISING\s+SPINDLE|OS\s*&\s*Y|OSY\b/.test(norm)) {
    attrs.valve_spindle = "RISING SPINDLE / OS&Y";
  }

  if (/GATE\s+VALVE/.test(norm)) attrs.valve_type = "GATE VALVE";
  else if (/BUTTERFLY\s+VALVE/.test(norm)) attrs.valve_type = "BUTTERFLY VALVE";
  else if (/CHECK\s+VALVE|NRV\b|DUAL\s+PLATE/.test(norm)) attrs.valve_type = "CHECK VALVE";
  else if (/DELUGE\s+VALVE/.test(norm)) attrs.valve_type = "DELUGE VALVE";
  else if (/ALARM\s+VALVE/.test(norm)) attrs.valve_type = "ALARM VALVE";
  else if (/BALL\s+VALVE/.test(norm)) attrs.valve_type = "BALL VALVE";
  else if (/AIR\s+RELEASE\s+VALVE/.test(norm)) attrs.valve_type = "AIR RELEASE VALVE";

  // Connections
  if (/GROOVED/.test(norm)) attrs.connection_type = "GROOVED";
  else if (/FLANGED/.test(norm)) attrs.connection_type = "FLANGED";
  else if (/THREADED|SCREWED/.test(norm)) attrs.connection_type = "THREADED";
  else if (/WAFER/.test(norm)) attrs.connection_type = "WAFER";
  else if (/WELDED/.test(norm)) attrs.connection_type = "WELDED";

  return attrs;
}

function technicalIdentityText(value: unknown): string {
  const { productText } = stripCommercialScope(String(value || ""));
  if (!productText) return "";

  // Remove generic commercial words without destroying product noun
  const core = productText
    .replace(/\b(?:SUPPLY|INSTALLATION|INSTALLING|TESTING|COMMISSIONING|PROVIDING|FIXING|ERECTION|FABRICATION)\b/gi, " ")
    .replace(/\b(?:AND\s+)?(?:OF|FOR)\s+(?=(?:APPROVED|SUITABLE|THE)\b)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizeText(core);
}

function extractTechnicalQualifiers(value: unknown): string[] {
  const text = String(value || "");
  const found = new Set<string>();
  const patterns = [
    /\b(?:SCH(?:EDULE)?\s*[-.:]?\s*\d+(?:\.\d+)?)\b/ig,
    /\b(?:CLASS\s+[A-Z0-9]+)\b/ig,
    /\b(?:PN\s*[-.:]?\s*\d+)\b/ig,
    /\b(?:K\s*[-.:]?\s*\d+)\b/ig,
    /\b(?:IS\s*[-.:]?\s*\d+(?:\s*[:.-]\s*\d+)?)\b/ig,
    /\b(?:NFPA\s*[-.:]?\s*\d+)\b/ig,
    /\b(?:UL\s*\/?\s*FM|UL\s+LISTED|UL\s+APPROVED|FM\s+APPROVED)\b/ig,
    /\b(?:GROOVED|FLANGED|THREADED|RISING\s+SPINDLE|OS\s*&\s*Y|UPRIGHT|PENDENT|SIDEWALL|CONCEALED)\b/ig,
    /\b\d{1,4}(?:\.\d+)?\s*(?:MM|NB)\b/ig,
    /\b\d{1,2}(?:\.\d{1,2})?\s*MM\s*THICK\b/ig
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const token = normalizeText(match[0]);
      if (token) found.add(token);
    }
  }
  return [...found].sort();
}

function explicitMaterial(value: unknown): string | null {
  return inferMaterial(String(value || ""));
}

function technicalDimensions(value: unknown): string[] {
  const text = normalizeText(String(value || ""));
  const found = new Set<string>();
  const re = /\b(\d{1,4}(?:\.\d+)?)\s*(?:MM|NB)\b/ig;
  for (const m of text.matchAll(re)) {
    if (m[1]) found.add(String(Math.round(Number(m[1]))));
  }
  return [...found];
}

// HARDENED CANONICAL TECHNICAL MATCH KEY
// Uses deterministic, category-specific tagged attributes so that different procurement items remain distinct.
function technicalMatchKey(rawDescription: unknown, parsedAttributes: any, uomCode?: unknown): string {
  const attrs = parsedAttributes && typeof parsedAttributes === "object" ? parsedAttributes : {};
  const raw = String(rawDescription || "").trim();
  const parent = String(attrs.parent_description || attrs.parent_context?.description || "").trim();
  const dimOnly = isDimensionOnly(raw);
  const context = dimOnly ? [parent, raw].filter(Boolean).join(" | ") : raw;

  const category = classifyCategory(context, [])?.code || "ITEM";
  const material = explicitMaterial(raw) || explicitMaterial(parent) || "";
  const dimension = dimensionFromText(context) || technicalDimensions(context)[0] || "";
  const dyn = extractDynamicTechnicalAttributes(context);
  const uom = normalizeUom(uomCode || attrs.source_uom || attrs.uom_code || "") || (category === "PIPE" ? "MTR" : "NOS");
  const make = String(attrs.make || dyn.make || "").trim();
  const model = String(attrs.model || dyn.model || "").trim();

  // Deterministic canonical key tags
  const keyParts: string[] = [`CAT:${category}`];

  if (dimension) keyParts.push(`DIM:${dimension}`);
  if (material) keyParts.push(`MAT:${material}`);

  if (category === "PIPE") {
    if (dyn.grade_class) keyParts.push(`CLS:${dyn.grade_class}`);
    if (dyn.schedule) keyParts.push(`SCH:${dyn.schedule}`);
    if (dyn.thickness_mm) keyParts.push(`THK:${dyn.thickness_mm}`);
    if (dyn.standard) keyParts.push(`STD:${dyn.standard}`);
    if (dyn.connection_type) keyParts.push(`CONN:${dyn.connection_type}`);
  } else if (category === "VALVE") {
    if (dyn.valve_type) keyParts.push(`VTYPE:${dyn.valve_type}`);
    if (dyn.valve_spindle) keyParts.push(`SPINDLE:${dyn.valve_spindle}`);
    if (dyn.pressure_rating) keyParts.push(`PRESS:${dyn.pressure_rating}`);
    if (dyn.connection_type) keyParts.push(`CONN:${dyn.connection_type}`);
    if (dyn.certification) keyParts.push(`CERT:${dyn.certification}`);
  } else if (category === "SPRINKLER") {
    if (dyn.sprinkler_type) keyParts.push(`STYPE:${dyn.sprinkler_type}`);
    if (dyn.k_factor) keyParts.push(`K:${dyn.k_factor}`);
    if (dyn.temperature_rating) keyParts.push(`TEMP:${dyn.temperature_rating}`);
    if (dyn.certification) keyParts.push(`CERT:${dyn.certification}`);
  } else if (category === "COATING") {
    if (dyn.thickness_mm) keyParts.push(`THK:${dyn.thickness_mm}`);
    if (dyn.standard) keyParts.push(`STD:${dyn.standard}`);
  } else {
    if (dyn.valve_type || dyn.sprinkler_type) keyParts.push(`TYPE:${dyn.valve_type || dyn.sprinkler_type}`);
    if (dyn.pressure_rating) keyParts.push(`PRESS:${dyn.pressure_rating}`);
    if (dyn.standard) keyParts.push(`STD:${dyn.standard}`);
    if (dyn.certification) keyParts.push(`CERT:${dyn.certification}`);
  }

  if (make) keyParts.push(`MAKE:${normalizeText(make)}`);
  if (model) keyParts.push(`MODEL:${normalizeText(model)}`);

  return keyParts.join("|");
}

// ==============================================================
// THREE-STATE TECHNICAL ATTRIBUTE COMPARISON (SAME | CONFLICT | UNKNOWN)
// Generic procurement comparison ensuring:
// - SAME: explicit equality
// - CONFLICT: hard rejection (null)
// - UNKNOWN: unresolved/missing on one or both sides (cannot be technical_exact)
// ==============================================================
type ThreeState = "SAME" | "CONFLICT" | "UNKNOWN";

interface AttributeComparison {
  attribute: string;
  state: ThreeState;
  inputValue: string | null;
  masterValue: string | null;
  unresolvedSide?: "master_missing" | "input_missing";
}

interface CompatibilityEvaluation {
  hasConflict: boolean;
  conflicts: AttributeComparison[];
  sames: AttributeComparison[];
  unresolved: AttributeComparison[];
  isExactTechnicalMatch: boolean;
}

function evaluateThreeStateCompatibility(
  category: string | null,
  input: {
    category: string | null;
    dimension: string | null;
    material: string | null;
    uom: string | null;
    dynamic: Record<string, any>;
  },
  master: {
    category: string | null;
    dimension: string | null;
    material: string | null;
    uom: string | null;
    dynamic: Record<string, any>;
  }
): CompatibilityEvaluation {
  const comparisons: AttributeComparison[] = [];

  function compareAttr(attrName: string, inVal: unknown, mastVal: unknown) {
    const rawIn = inVal != null && String(inVal).trim() ? String(inVal).trim() : null;
    const rawMast = mastVal != null && String(mastVal).trim() ? String(mastVal).trim() : null;

    const normIn = rawIn ? normalizeText(rawIn) : "";
    const normMast = rawMast ? normalizeText(rawMast) : "";

    // Both missing: UNKNOWN state, but both sides agree in omitting it
    if (!normIn && !normMast) {
      comparisons.push({ attribute: attrName, state: "UNKNOWN", inputValue: null, masterValue: null });
      return;
    }

    // Input missing, Master specified: UNKNOWN state (unresolved on input)
    if (!normIn && normMast) {
      comparisons.push({
        attribute: attrName,
        state: "UNKNOWN",
        inputValue: null,
        masterValue: rawMast,
        unresolvedSide: "input_missing"
      });
      return;
    }

    // Input specified, Master missing: UNKNOWN state (unresolved on master)
    if (normIn && !normMast) {
      comparisons.push({
        attribute: attrName,
        state: "UNKNOWN",
        inputValue: rawIn,
        masterValue: null,
        unresolvedSide: "master_missing"
      });
      return;
    }

    // Special certification check for explicit negation (UL/FM vs NON-UL/FM)
    if (attrName === "certification") {
      const isNegIn = /NON|NOT|WITHOUT/.test(normIn);
      const isNegMast = /NON|NOT|WITHOUT/.test(normMast);
      const hasCertIn = /UL|FM/.test(normIn);
      const hasCertMast = /UL|FM/.test(normMast);

      if ((isNegIn && hasCertMast && !isNegMast) || (isNegMast && hasCertIn && !isNegIn)) {
        comparisons.push({ attribute: attrName, state: "CONFLICT", inputValue: rawIn, masterValue: rawMast });
        return;
      }
    }

    // Both specified: either SAME or CONFLICT
    if (normIn === normMast) {
      comparisons.push({ attribute: attrName, state: "SAME", inputValue: rawIn, masterValue: rawMast });
    } else {
      comparisons.push({ attribute: attrName, state: "CONFLICT", inputValue: rawIn, masterValue: rawMast });
    }
  }

  // Core procurement attributes
  compareAttr("category", input.category, master.category);
  compareAttr("dimension", input.dimension, master.dimension);
  compareAttr("material", input.material, master.material);

  // Compare every dynamic technical attribute present in either input or master
  const dynamicKeys = new Set<string>([
    "schedule",
    "grade_class",
    "thickness_mm",
    "standard",
    "valve_type",
    "valve_spindle",
    "k_factor",
    "temperature_rating",
    "pressure_rating",
    "certification",
    "sprinkler_type",
    "connection_type",
    ...Object.keys(input.dynamic || {}),
    ...Object.keys(master.dynamic || {})
  ]);

  for (const key of dynamicKeys) {
    if (key === "standards" || key === "technical_dimensions" || key === "make" || key === "model") continue;
    if (input.dynamic[key] != null || master.dynamic[key] != null) {
      compareAttr(key, input.dynamic[key], master.dynamic[key]);
    }
  }

  const conflicts = comparisons.filter((c) => c.state === "CONFLICT");
  const sames = comparisons.filter((c) => c.state === "SAME");
  const unresolved = comparisons.filter((c) => c.state === "UNKNOWN" && c.unresolvedSide != null);

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    sames,
    unresolved,
    isExactTechnicalMatch: conflicts.length === 0 && unresolved.length === 0 && sames.length > 0
  };
}

function masterSignature(line: any): {
  signature: string;
  name: string;
  description: string;
  attrs: any;
  uom: string | null;
  itemType: any;
  category: any | null;
} {
  const attrs = line.parsed_attributes && typeof line.parsed_attributes === "object" ? line.parsed_attributes : {};
  const parent = compactParent(
    attrs.parent_description ||
    attrs.parent_context?.description ||
    line._resolved_parent_description ||
    ""
  );
  const child = String(line.raw_description || line.normalized_description || "").trim();
  const dimOnly = isDimensionOnly(child);
  const contextText = [parent, child].filter(Boolean).join(" | ");

  const dimension = dimOnly
    ? dimensionFromText(child) || dimensionFromText(contextText)
    : dimensionFromText(child) || dimensionFromText(contextText);

  const make = String(attrs.make || "").trim();
  const model = String(attrs.model || "").trim();

  const classificationText = dimOnly ? contextText : child;
  const category = classifyCategory(classificationText, line._categories || []);
  const categoryCode = category?.code || null;
  const categoryName = category?.name || "MEP Item";

  const material = explicitMaterial(child) || explicitMaterial(parent);
  const canonicalUom = sourceUomFromLine(line);
  const itemType = classifyItemType(dimOnly ? parent : child);
  const dynamicAttrs = extractDynamicTechnicalAttributes(contextText);

  let name = "";
  let identityText = "";

  if (dimOnly) {
    // Child is dimension only (e.g. "150mm Nominal dia"). Build canonical identity from parent technical specs.
    const parts: string[] = [];
    if (material) parts.push(material);
    if (dynamicAttrs.grade_class) parts.push(String(dynamicAttrs.grade_class));
    if (dynamicAttrs.schedule) parts.push(String(dynamicAttrs.schedule));

    if (categoryCode === "PIPE") {
      parts.push("Pipe");
      if (dimension) parts.push(`${dimension} NB`);
    } else if (categoryCode === "VALVE") {
      const vtype = dynamicAttrs.valve_type || (/GATE/i.test(parent) ? "Gate Valve" : /BUTTERFLY/i.test(parent) ? "Butterfly Valve" : "Valve");
      parts.push(String(vtype));
      if (dynamicAttrs.valve_spindle) parts.push(String(dynamicAttrs.valve_spindle));
      if (dimension) parts.push(`${dimension} NB`);
    } else if (categoryCode === "SPRINKLER") {
      parts.push("Sprinkler");
      if (dynamicAttrs.sprinkler_type) parts.push(String(dynamicAttrs.sprinkler_type));
      if (dynamicAttrs.k_factor) parts.push(String(dynamicAttrs.k_factor));
      if (dimension) parts.push(`${dimension} NB`);
    } else {
      parts.push(categoryName);
      if (dimension) parts.push(`${dimension}mm`);
    }

    if (dynamicAttrs.thickness_mm) parts.push(String(dynamicAttrs.thickness_mm));
    if (Array.isArray(dynamicAttrs.standards) && dynamicAttrs.standards.length) {
      parts.push(dynamicAttrs.standards.slice(0, 2).join(" "));
    }

    name = parts.join(" ").trim();
    identityText = name;
  } else {
    // Complete line. Extract core product noun + technical qualifiers.
    const core = technicalIdentityText(child);
    const qualifiers = extractTechnicalQualifiers(contextText);
    identityText = [core, ...qualifiers].filter(Boolean).join(" | ");
    name = core;
  }

  const technicalKey = technicalMatchKey(child, { ...attrs, parent_description: parent }, canonicalUom);
  const signature = technicalKey || [categoryCode || "OTHER", material || "", dimension || "", canonicalUom || "", normalizeText(identityText)].join("|");

  return {
    signature,
    name: name.slice(0, 240),
    description: dimOnly ? contextText.slice(0, 2000) : child.slice(0, 2000),
    attrs: {
      identity_signature: signature,
      category_code: categoryCode,
      source_parent_description: parent || null,
      source_child_description: child || null,
      source_uom: canonicalUom,
      dimension_mm: dimension ? Number(dimension) : null,
      material,
      make: make || null,
      model: model || null,
      technical_identity_text: identityText,
      technical_qualifiers: extractTechnicalQualifiers(contextText),
      technical_dimensions: technicalDimensions(contextText),
      technical_match_key: technicalKey,
      standards: dynamicAttrs.standards || [],
      dynamic_attributes: dynamicAttrs,
      source_attributes: attrs,
      catalog_status: "DRAFT"
    },
    uom: canonicalUom,
    itemType,
    category
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const currentUser = await authenticate(req);
    const body = await req.json();

    if (!["identify", "prepare-master-items", "review", "audit", "reprocess-master-boq"].includes(body.action)) {
      return new Response(JSON.stringify({ error: "Supported actions: identify, prepare-master-items, review, audit, reprocess-master-boq" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tenantCompanyId = body.tenant_company_id;
    if (!tenantCompanyId) throw new Error("tenant_company_id is required");

    const { tenantId } = await companyAccess(currentUser.id, tenantCompanyId);

    // ==============================================================
    // ACTION: AUDIT
    // ==============================================================
    if (body.action === "audit") {
      const extractionId = uuidLike(body.extraction_id) ? body.extraction_id : null;
      let q = admin.from("mep_extraction_lines")
        .select("id,line_no,raw_description,normalized_description,uom_code,item_type,domain_code,category_id,parsed_attributes,line_type,procurement_scope,parent_line_ref")
        .eq("tenant_id", tenantId)
        .eq("tenant_company_id", tenantCompanyId);
      if (extractionId) q = q.eq("extraction_id", extractionId);
      const { data: auditLines, error: auditError } = await q.order("line_no");
      if (auditError) throw new Error("Unable to audit extraction lines: " + auditError.message);

      const lines = auditLines || [];
      const itemLines = lines.filter((l: any) => String(l.line_type || "").toUpperCase() === "ITEM");
      const dimensionOnly = itemLines.filter((l: any) => isDimensionOnly(l.raw_description || ""));
      const missingUom = itemLines.filter((l: any) => !sourceUomFromLine(l));
      const missingCategory = itemLines.filter((l: any) => !l.category_id);
      const dimensionWithoutParent = dimensionOnly.filter((l: any) =>
        !l.parsed_attributes?.parent_description &&
        !l.parsed_attributes?.parent_context?.description &&
        !l.parent_line_ref
      );
      const serviceLike = itemLines.filter((l: any) => classifyItemType(
        [l.raw_description, l.parsed_attributes?.parent_description, l.parsed_attributes?.parent_context?.description].filter(Boolean).join(" ")
      ) === "service");

      const { data: catalog, error: catalogError } = await admin.from("inventory_items")
        .select("id,item_code,name,is_active,identity_attributes")
        .eq("tenant_id", tenantId)
        .eq("tenant_company_id", tenantCompanyId);
      if (catalogError) throw new Error("Unable to audit Master Items: " + catalogError.message);

      const genericOrSuperseded = (catalog || []).filter((i: any) => {
        const n = normalizeText(i.name || "");
        return isDimensionOnly(n) || String(i.identity_attributes?.catalog_status || "").toUpperCase() === "SUPERSEDED";
      });

      return new Response(JSON.stringify({
        success: true, mode: "audit", extraction_id: extractionId,
        totals: {
          all_lines: lines.length, item_lines: itemLines.length, section_lines: lines.length - itemLines.length,
          missing_uom: missingUom.length, missing_category: missingCategory.length,
          dimension_only: dimensionOnly.length, dimension_without_parent: dimensionWithoutParent.length,
          service_like_lines: serviceLike.length, catalog_items: (catalog || []).length,
          generic_or_superseded_catalog_items: genericOrSuperseded.length
        },
        issues: {
          missing_uom: missingUom.slice(0, 100).map((l: any) => ({ id: l.id, line_no: l.line_no, description: l.raw_description })),
          missing_category: missingCategory.slice(0, 100).map((l: any) => ({ id: l.id, line_no: l.line_no, description: l.raw_description })),
          dimension_without_parent: dimensionWithoutParent.slice(0, 100).map((l: any) => ({ id: l.id, line_no: l.line_no, description: l.raw_description })),
          service_like: serviceLike.slice(0, 100).map((l: any) => ({ id: l.id, line_no: l.line_no, description: l.raw_description }))
        }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ==============================================================
    // ACTION: REVIEW (HUMAN VERIFICATION / REJECTION / CORRECTION)
    // Supports both mep_extraction_lines and master_boq_lines (Part 8)
    // ==============================================================
    if (body.action === "review") {
      const inventoryItemId = uuidLike(body.inventory_item_id) ? body.inventory_item_id : null;
      const sourceLineId = uuidLike(body.source_line_id) ? body.source_line_id : null;
      const decision = String(body.decision || "").toLowerCase();
      if (!tenantCompanyId || !inventoryItemId || !sourceLineId) {
        throw new Error("tenant_company_id, inventory_item_id and source_line_id are required");
      }
      if (!["accepted", "corrected", "rejected"].includes(decision)) {
        throw new Error("decision must be accepted, corrected or rejected");
      }

      const { data: item, error: itemError } = await admin.from("inventory_items")
        .select("id,item_code,name,description,identity_attributes,is_active")
        .eq("id", inventoryItemId).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId).maybeSingle();
      if (itemError || !item) throw new Error("Master Item not found");

      // Check whether source_line_id is an extraction line OR a master boq line
      const { data: extLine } = await admin.from("mep_extraction_lines")
        .select("id,raw_description,normalized_description,parsed_attributes,extraction_id,candidate_inventory_item_id,match_confidence,match_method")
        .eq("id", sourceLineId).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId).maybeSingle();

      let boqLine: any = null;
      if (!extLine) {
        const { data: bLine } = await admin.from("master_boq_lines")
          .select("id,master_boq_id,line_no,original_description,normalized_description,specification,inventory_item_id,match_status")
          .eq("id", sourceLineId).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId).maybeSingle();
        boqLine = bLine;
      }

      if (!extLine && !boqLine) {
        throw new Error("Source line not found in extraction lines or master boq lines");
      }

      const now = new Date().toISOString();
      const confidence = Number(body.confidence_score ?? 1);
      const safeConfidence = Math.max(0, Math.min(1, confidence));
      const rawDesc = extLine ? extLine.raw_description : boqLine.original_description;
      const parsedAttrs = extLine ? extLine.parsed_attributes || {} : boqLine.specification || {};
      const sourceTypeId = extLine ? "mep_extraction" : "master_boq";
      const sourceDocId = extLine ? extLine.extraction_id : boqLine.master_boq_id;

      if (decision === "rejected") {
        await admin.from("mep_item_match_candidates").update({
          status: "rejected", reviewer_user_id: currentUser.id, reviewed_at: now, updated_at: now
        }).eq("source_line_id", sourceLineId).eq("candidate_inventory_item_id", inventoryItemId);

        if (boqLine) {
          await admin.from("master_boq_lines").update({
            match_status: "rejected",
            verified_by: currentUser.id,
            verified_at: now,
            updated_at: now
          }).eq("id", sourceLineId);
        }
      } else {
        // Activate and verify Master Item
        const identityAttributes = {
          ...(item.identity_attributes || {}),
          catalog_status: "VERIFIED",
          verified_by: currentUser.id,
          verified_at: now,
          verification_source: "human_review"
        };
        const { error: activateError } = await admin.from("inventory_items").update({
          is_active: true, identity_attributes: identityAttributes, updated_at: now
        }).eq("id", inventoryItemId).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId);
        if (activateError) throw new Error("Unable to activate Master Item: " + activateError.message);

        // Cross-BOQ Learning: Register technical alias and technical match key (Part 10)
        const aliasText = String(rawDesc || "").trim();
        if (aliasText) {
          const techAlias = technicalIdentityText(aliasText);
          const techKey = technicalMatchKey(aliasText, parsedAttrs);
          const normalizedAlias = normalizeText(techAlias || aliasText);

          const { data: existingAlias } = await admin
            .from("inventory_item_aliases")
            .select("id")
            .eq("tenant_company_id", tenantCompanyId)
            .eq("normalized_alias", normalizedAlias)
            .eq("alias_type", "description")
            .is("party_type", null)
            .is("party_id", null)
            .maybeSingle();

          const aliasPayload = {
            tenant_id: tenantId, tenant_company_id: tenantCompanyId,
            inventory_item_id: inventoryItemId, alias_text: aliasText, normalized_alias: normalizedAlias,
            alias_type: "description", source_type: sourceTypeId, source_line_id: sourceLineId,
            confidence_score: safeConfidence, is_verified: true, verified_by: currentUser.id, verified_at: now,
            created_by: currentUser.id, updated_at: now
          };

          if (existingAlias) {
            await admin.from("inventory_item_aliases").update(aliasPayload).eq("id", existingAlias.id);
          } else {
            await admin.from("inventory_item_aliases").insert({ id: crypto.randomUUID(), ...aliasPayload });
          }

          // Register technical match key as an alias ONLY if target Master Item has complete matching technical identity
          if (techKey && techKey !== normalizedAlias) {
            const { data: targetItem } = await admin
              .from("inventory_items")
              .select("identity_attributes")
              .eq("id", inventoryItemId)
              .maybeSingle();

            const targetAttrs = targetItem?.identity_attributes || {};
            const targetKey = String(targetAttrs.technical_match_key || targetAttrs.identity_signature || "").trim();

            if (targetKey && targetKey === techKey) {
              const { data: existingKeyAlias } = await admin.from("inventory_item_aliases")
                .select("id").eq("tenant_company_id", tenantCompanyId).eq("normalized_alias", techKey).maybeSingle();
              if (!existingKeyAlias) {
                await admin.from("inventory_item_aliases").insert({
                  id: crypto.randomUUID(), tenant_id: tenantId, tenant_company_id: tenantCompanyId,
                  inventory_item_id: inventoryItemId, alias_text: techKey, normalized_alias: techKey,
                  alias_type: "technical_key", source_type: sourceTypeId, source_line_id: sourceLineId,
                  confidence_score: 1, is_verified: true, verified_by: currentUser.id, verified_at: now,
                  created_by: currentUser.id, updated_at: now
                });
              }
            }
          }
        }

        // Update candidates and extraction/master_boq lines
        const candidateUpdate = {
          status: "accepted", reviewer_user_id: currentUser.id, reviewed_at: now, updated_at: now,
          confidence_score: safeConfidence, match_method: decision === "corrected" ? "human_corrected" : "human_verified"
        };
        const { data: existingCandidate } = await admin
          .from("mep_item_match_candidates")
          .select("id")
          .eq("tenant_company_id", tenantCompanyId)
          .eq("source_line_id", sourceLineId)
          .eq("candidate_inventory_item_id", inventoryItemId)
          .maybeSingle();

        if (existingCandidate) {
          await admin.from("mep_item_match_candidates").update(candidateUpdate).eq("id", existingCandidate.id);
        } else {
          await admin.from("mep_item_match_candidates").insert({
            id: crypto.randomUUID(), tenant_id: tenantId, tenant_company_id: tenantCompanyId,
            raw_description: rawDesc,
            normalized_description: normalizeText(rawDesc),
            parsed_attributes: parsedAttrs,
            candidate_inventory_item_id: inventoryItemId,
            match_method: decision === "corrected" ? "human_corrected" : "human_verified",
            confidence_score: safeConfidence,
            match_reasons: [decision === "corrected" ? "Human corrected Master Item" : "Human verified Master Item"],
            source_type: sourceTypeId, source_id: sourceDocId, source_line_id: sourceLineId,
            status: "accepted", reviewer_user_id: currentUser.id, reviewed_at: now, created_by: currentUser.id
          });
        }

        if (extLine) {
          await admin.from("mep_extraction_lines").update({
            candidate_inventory_item_id: inventoryItemId, match_confidence: safeConfidence,
            match_method: decision === "corrected" ? "human_corrected" : "human_verified",
            match_reasons: [decision === "corrected" ? "Human corrected Master Item" : "Human verified Master Item"],
            review_status: "approved", reviewed_by: currentUser.id, reviewed_at: now, updated_at: now
          }).eq("id", sourceLineId);
        }

        if (boqLine) {
          await admin.from("master_boq_lines").update({
            inventory_item_id: inventoryItemId,
            match_status: "verified",
            match_method: decision === "corrected" ? "human_corrected" : "human_verified",
            match_confidence: safeConfidence,
            verified_by: currentUser.id,
            verified_at: now,
            updated_at: now
          }).eq("id", sourceLineId);
        }

        await admin.from("inventory_item_match_feedback").insert({
          id: crypto.randomUUID(), tenant_id: tenantId, tenant_company_id: tenantCompanyId,
          raw_description: rawDesc, normalized_description: normalizeText(rawDesc),
          parsed_attributes: parsedAttrs, proposed_inventory_item_id: extLine?.candidate_inventory_item_id || boqLine?.inventory_item_id,
          final_inventory_item_id: inventoryItemId, match_method: decision === "corrected" ? "human_corrected" : "human_verified",
          confidence_score: safeConfidence, decision, source_type: sourceTypeId, source_id: sourceDocId,
          source_line_id: sourceLineId, reviewer_user_id: currentUser.id, reviewed_at: now, created_by: currentUser.id
        });
      }

      return new Response(JSON.stringify({
        success: true, decision, inventory_item_id: inventoryItemId, source_line_id: sourceLineId,
        source_context: extLine ? "mep_extraction_lines" : "master_boq_lines"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ==============================================================
    // ACTION: PREPARE-MASTER-ITEMS
    // Prepares Draft Master Items with technical identity, avoiding commercial scope
    // ==============================================================
    if (body.action === "prepare-master-items") {
      const extractionId = uuidLike(body.extraction_id) ? body.extraction_id : null;
      let lineQuery = admin.from("mep_extraction_lines")
        .select("id,line_no,raw_description,normalized_description,uom_code,item_type,domain_code,parsed_attributes,source_section,line_type")
        .eq("tenant_id", tenantId)
        .eq("tenant_company_id", tenantCompanyId);
      if (extractionId) lineQuery = lineQuery.eq("extraction_id", extractionId);
      const { data: lines, error: lineError } = await lineQuery.order("line_no");
      if (lineError) throw new Error("Unable to load extraction lines: " + lineError.message);

      const { data: categories } = await admin
        .from("mep_item_categories").select("id,code,name").eq("domain_code", "FIRE_FIGHTING").eq("is_active", true);

      const existing = await admin.from("inventory_items")
        .select("id,item_code,name,normalized_name,identity_attributes,base_uom_code,is_active")
        .eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId);
      if (existing.error) throw new Error("Unable to load existing Master Items: " + existing.error.message);

      const existingBySignature = new Map<string, any>();
      for (const item of existing.data || []) {
        const sig = item.identity_attributes?.identity_signature || item.identity_attributes?.technical_match_key;
        if (sig) existingBySignature.set(sig, item);
      }

      const prepared: any[] = [];
      const created: any[] = [];
      const skipped: any[] = [];
      const seen = new Set<string>();
      let inferredParentDescription = "";

      for (const line of lines || []) {
        const attrs = line.parsed_attributes || {};
        const sourceUom = sourceUomFromLine(line);
        if (!sourceUom) {
          skipped.push({ source_line_id: line.id, line_no: line.line_no, reason: "No usable UOM found" });
          continue;
        }

        const rawChild = String(line.raw_description || line.normalized_description || "");
        const isDimOnly = isDimensionOnly(rawChild);

        if (!isDimOnly &&
            String(line.line_type || "ITEM").toUpperCase() === "ITEM" &&
            rawChild.trim().length >= 12 &&
            !/AGAINST DELIVERY|AGAINST THE INSTALLATION|COMMISSIONING SHALL BE INCLUDED|LIASONING AND APPROVAL/i.test(rawChild)) {
          inferredParentDescription = rawChild.trim();
        }

        const preparedLine: any = {
          ...line,
          _categories: categories || [],
          _resolved_parent_description:
            attrs.parent_description ||
            attrs.parent_context?.description ||
            (isDimOnly ? inferredParentDescription : "")
        };

        const identity = masterSignature(preparedLine);

        if (isDimOnly && !identity.category?.code) {
          skipped.push({ source_line_id: line.id, line_no: line.line_no, reason: "Dimension-only child has no classified parent identity" });
          continue;
        }
        if (identity.itemType === "service" && identity.category?.code === "SERVICE") {
          skipped.push({ source_line_id: line.id, line_no: line.line_no, reason: "Service line excluded from stock Master Item preparation" });
          continue;
        }

        if (seen.has(identity.signature)) continue;
        seen.add(identity.signature);

        let item = existingBySignature.get(identity.signature);
          skipped.push({ source_line_id: line.id, line_no: line.line_no, reason: "No existing Master Item matched the canonical signature" });
          continue;
        prepared.push({ source_line_id: line.id, inventory_item_id: item.id, signature: identity.signature, name: item.name });
      }

      return new Response(JSON.stringify({
        success: true, mode: "prepare-master-items", extraction_id: extractionId,
        scanned_lines: (lines || []).length, draft_items_created: created.length,
        draft_items: created, prepared_lines: prepared.length, skipped_lines: skipped.length, skipped,
        note: "Draft Master Items are inactive until human verification. Commercial fields and transactions are protected."
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ==============================================================
    // ACTION: REPROCESS-MASTER-BOQ (SAFE REPROCESSING - PART 7)
    // 1. Accepts explicit line_ids array (preferred) or offset fallback
    // 2. EXPLICITLY PROTECTS VERIFIED and REJECTED lines against any overwrites
    // 3. Only processes UNMATCHED and CANDIDATE lines
    // 4. Commercial fields (quantity, uom, rates, amounts) are NEVER modified
    // ==============================================================
    if (body.action === "reprocess-master-boq") {
      const masterBoqId = uuidLike(body.master_boq_id) ? body.master_boq_id : null;
      if (!masterBoqId) throw new Error("master_boq_id is required");

      const { data: boq, error: boqError } = await admin
        .from("master_boqs")
        .select("id,tenant_id,tenant_company_id,status,is_current")
        .eq("id", masterBoqId)
        .eq("tenant_id", tenantId)
        .eq("tenant_company_id", tenantCompanyId)
        .maybeSingle();
      if (boqError || !boq) throw new Error("Master BOQ not found");

      // Build line query: if explicit line_ids provided, use them; else fallback to limit/offset
      const requestedLineIds = Array.isArray(body.line_ids) ? body.line_ids.filter(uuidLike) : [];
      let lineQuery = admin.from("master_boq_lines")
        .select("id,line_no,original_description,normalized_description,specification,quantity,uom_code,line_type,procurement_scope,inventory_item_id,match_status,source_extraction_line_id")
        .eq("master_boq_id", masterBoqId)
        .eq("tenant_id", tenantId)
        .eq("tenant_company_id", tenantCompanyId);

      if (requestedLineIds.length > 0) {
        lineQuery = lineQuery.in("id", requestedLineIds);
      } else {
        const limit = Math.min(Math.max(Number(body.limit || 50), 1), 100);
        const offset = Math.max(Number(body.offset || 0), 0);
        lineQuery = lineQuery.order("line_no", { ascending: true }).range(offset, offset + limit - 1);
      }

      const { data: lines, error: lineError } = await lineQuery;
      if (lineError) throw new Error("Unable to load Master BOQ lines: " + lineError.message);

      const authorization = req.headers.get("Authorization") || "";
      const results: any[] = [];

      for (const line of lines || []) {
        const currentMatchStatus = String(line.match_status || "").toLowerCase();

        // STRICT REPROCESSING SAFETY (Part 7): NEVER overwrite human decisions (VERIFIED or REJECTED)
        if (currentMatchStatus === "verified" || currentMatchStatus === "rejected") {
          results.push({
            line_id: line.id,
            line_no: line.line_no,
            status: "protected",
            match_status: currentMatchStatus,
            reason: `Human decision preserved (${currentMatchStatus})`
          });
          continue;
        }

        const type = String(line.line_type || "ITEM").toUpperCase();
        if (type !== "ITEM") {
          results.push({ line_id: line.id, line_no: line.line_no, status: "skipped", reason: "non-item line" });
          continue;
        }

        let sourceLine: any = null;
        if (uuidLike(line.source_extraction_line_id)) {
          const { data } = await admin.from("mep_extraction_lines")
            .select("id,raw_description,normalized_description,uom_code,parsed_attributes")
            .eq("id", line.source_extraction_line_id)
            .eq("tenant_id", tenantId)
            .eq("tenant_company_id", tenantCompanyId)
            .maybeSingle();
          sourceLine = data || null;
        }

        const effectiveRawDescription = sourceLine?.raw_description || line.original_description;
        const effectiveParsedAttributes = {
          ...(line.specification && typeof line.specification === "object" ? line.specification : {}),
          ...(sourceLine?.parsed_attributes && typeof sourceLine.parsed_attributes === "object" ? sourceLine.parsed_attributes : {}),
        };

        const response = await fetch(`${supabaseUrl}/functions/v1/mep-item-identification`, {
          method: "POST",
          headers: {
            "Authorization": authorization,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "identify",
            tenant_company_id: tenantCompanyId,
            raw_description: effectiveRawDescription,
            normalized_description: line.normalized_description,
            uom_code: line.uom_code,
            parsed_attributes: effectiveParsedAttributes,
            source_type: "master_boq",
            source_id: masterBoqId,
            source_line_id: line.id,
            include_drafts: true, // Allow matching prepared draft Master Items
          }),
        });

        let result: any = null;
        try { result = await response.json(); } catch { result = null; }

        const recommendation = result?.recommendation;
        if (response.ok && recommendation?.inventory_item_id) {
          const confidence = Number(recommendation.confidence_score || 0);
          const { error: updateError } = await admin.from("master_boq_lines").update({
            inventory_item_id: recommendation.inventory_item_id,
            match_status: "candidate", // Candidates are never auto-verified (Part 11)
            match_method: recommendation.match_method || "deterministic",
            match_confidence: confidence,
            match_explanation: {
              source: "reprocess_deterministic_match",
              requires_human_review: true,
              recommendation,
              processed_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          }).eq("id", line.id).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId);

          if (updateError) throw new Error(`Unable to update BOQ line ${line.line_no}: ${updateError.message}`);
          results.push({ line_id: line.id, line_no: line.line_no, status: "candidate", inventory_item_id: recommendation.inventory_item_id, confidence });
        } else {
          const { error: updateError } = await admin.from("master_boq_lines").update({
            match_status: "unmatched",
            match_method: null,
            match_confidence: null,
            match_explanation: {
              source: "reprocess_deterministic_match",
              requires_human_review: true,
              reason: result?.error || "No candidate found",
              processed_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          }).eq("id", line.id).eq("tenant_id", tenantId).eq("tenant_company_id", tenantCompanyId);
          if (updateError) throw new Error(`Unable to update BOQ line ${line.line_no}: ${updateError.message}`);
          results.push({ line_id: line.id, line_no: line.line_no, status: "unmatched" });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        mode: "reprocess-master-boq",
        master_boq_id: masterBoqId,
        processed_lines: results.length,
        results,
        note: "VERIFIED and REJECTED lines protected. Commercial scope untouched. Candidates require human verification."
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ==============================================================
    // ACTION: IDENTIFY
    // Evaluates technical identity against active and draft Master Items
    // ==============================================================
    const rawDescription = String(body.raw_description || "").trim();
    if (!rawDescription) throw new Error("raw_description is required");

    const parsedAttributes = (body.parsed_attributes && typeof body.parsed_attributes === "object")
      ? body.parsed_attributes
      : {};

    const domainCode = body.domain_code ? String(body.domain_code) : null;
    const rules = await loadRules(domainCode);
    const normalizedDescription = applyRules(normalizeText(rawDescription), rules);

    const explicitChildDescription = String(
      parsedAttributes.source_child_description ||
      parsedAttributes.source_description ||
      "",
    ).trim();
    const childDescription = explicitChildDescription ||
      (rawDescription.includes(" — ")
        ? rawDescription.slice(rawDescription.lastIndexOf(" — ") + 3).trim()
        : (rawDescription.includes(" + ")
            ? rawDescription.slice(rawDescription.lastIndexOf(" + ") + 3).trim()
            : rawDescription));
    const normalizedChildDescription = applyRules(normalizeText(childDescription), rules);

    const { data: items, error: itemsError } = await admin
      .from("inventory_items")
      .select("id,item_code,name,description,category,item_type,base_uom_code,hsn_sac_code,normalized_name,domain_code,identity_attributes,identity_version,mep_category_id,is_active")
      .eq("tenant_id", tenantId)
      .eq("tenant_company_id", tenantCompanyId)
      .limit(3000);

    if (itemsError) throw new Error(`Unable to load Master Items: ${itemsError.message}`);

    const includeDrafts = body.include_drafts === true;
    const usableItems = (items || []).filter((item: any) => {
      if (item.is_active) return true;
      if (!includeDrafts) return false;
      const attrs = item.identity_attributes && typeof item.identity_attributes === "object"
        ? item.identity_attributes : {};
      return String(attrs.catalog_status || "").toUpperCase() === "DRAFT" || String(item.item_code || "").startsWith("DRAFT-");
    });

    const { data: aliases, error: aliasError } = await admin
      .from("inventory_item_aliases")
      .select("inventory_item_id,alias_text,normalized_alias,alias_type,party_type,party_id,is_verified,confidence_score")
      .eq("tenant_id", tenantId)
      .eq("tenant_company_id", tenantCompanyId)
      .limit(5000);

    if (aliasError) throw new Error(`Unable to load item aliases: ${aliasError.message}`);

    const inputTokens = tokenSet(normalizedDescription);
    const childInputTokens = tokenSet(normalizedChildDescription);
    const inputDimension = dimensionFromText(normalizedChildDescription) || dimensionFromText(normalizedDescription);
    const inputContextText = [
      String(parsedAttributes.parent_description || ""),
      String(parsedAttributes.parent_context?.description || ""),
      rawDescription,
    ].join(" ");

    const inputCategory = classifyCategory(inputContextText, [])?.code || null;
    const inputMaterial = inferMaterial(inputContextText);
    const inputDynamic = extractDynamicTechnicalAttributes(inputContextText);
    const inputUom = normalizeUom(
      parsedAttributes.source_uom || body.uom_code ||
      parsedAttributes.supply_uom_code || parsedAttributes.installation_uom_code
    );
    const inputTechnicalKey = technicalMatchKey(rawDescription, parsedAttributes, inputUom);

    const aliasByItem = new Map<string, any[]>();
    for (const alias of aliases || []) {
      const list = aliasByItem.get(alias.inventory_item_id) || [];
      list.push(alias);
      aliasByItem.set(alias.inventory_item_id, list);
    }

    const candidates = usableItems.map((item: any) => {
      const names = [
        item.name,
        item.description,
        item.normalized_name,
        item.item_code,
      ].filter(Boolean).map((v) => normalizeText(v));

      const itemAttrs = item.identity_attributes && typeof item.identity_attributes === "object"
        ? item.identity_attributes as Record<string, unknown>
        : {};
      const itemParent = String(itemAttrs.source_parent_description || "");
      const itemContextText = [itemParent, String(item.description || ""), String(item.name || "")].join(" ");
      const itemDimension = itemAttrs.dimension_mm != null
        ? String(itemAttrs.dimension_mm)
        : dimensionFromText(itemContextText);
      const itemCategory = categoryCodeFromItem(item) || classifyCategory(itemContextText, [])?.code || null;
      const itemMaterial = itemAttrs.material ? String(itemAttrs.material).toUpperCase() : inferMaterial(itemContextText);
      const itemUom = normalizeUom(item.base_uom_code);
      const itemDynamic = (itemAttrs.dynamic_attributes && typeof itemAttrs.dynamic_attributes === "object")
        ? itemAttrs.dynamic_attributes as Record<string, any>
        : extractDynamicTechnicalAttributes(itemContextText);

      // Dimension-only lines must not become master item candidates
      const normalizedItemName = normalizeText(String(item.name || ""));
      if (isDimensionOnly(normalizedItemName) || String(itemAttrs.catalog_status || "").toUpperCase() === "SUPERSEDED") {
        return null;
      }

      // Generic Three-State Attribute Compatibility Evaluation (SAME | CONFLICT | UNKNOWN)
      const compatibility = evaluateThreeStateCompatibility(
        inputCategory || itemCategory,
        {
          category: inputCategory,
          dimension: inputDimension,
          material: inputMaterial,
          uom: inputUom,
          dynamic: inputDynamic,
        },
        {
          category: itemCategory,
          dimension: itemDimension,
          material: itemMaterial,
          uom: itemUom,
          dynamic: itemDynamic,
        }
      );

      // Section 3: Explicit technical conflict must remain a hard rejection (null)
      if (compatibility.hasConflict) {
        return null;
      }

      const hasUnresolved = compatibility.unresolved.length > 0;

      const exact = names.includes(normalizedDescription) ||
        (normalizedChildDescription && names.includes(normalizedChildDescription));
      const nameTokenScore = Math.max(0, ...names.map((n) => jaccard(inputTokens, tokenSet(n))));
      const childNameTokenScore = Math.max(0, ...names.map((n) => jaccard(childInputTokens, tokenSet(n))));

      const aliasesForItem = aliasByItem.get(item.id) || [];
      const itemTechnicalKey = String(itemAttrs.technical_match_key || "").trim();
      let technicalExact = Boolean(
        !hasUnresolved &&
        compatibility.isExactTechnicalMatch &&
        inputTechnicalKey &&
        itemTechnicalKey &&
        inputTechnicalKey === itemTechnicalKey
      );

      let aliasExact = false;
      let aliasScore = 0;
      let childAliasScore = 0;
      for (const alias of aliasesForItem) {
        const a = normalizeText(alias.normalized_alias || alias.alias_text);
        if (!a) continue;
        if (!hasUnresolved) {
          if (a === normalizedDescription || (normalizedChildDescription && a === normalizedChildDescription)) aliasExact = true;
          if (inputTechnicalKey && a === normalizeText(inputTechnicalKey)) aliasExact = true;
        }
        aliasScore = Math.max(aliasScore, jaccard(inputTokens, tokenSet(a)));
        childAliasScore = Math.max(childAliasScore, jaccard(childInputTokens, tokenSet(a)));
      }

      const attr = attributeScore(parsedAttributes, item);
      const domainMatch = !domainCode || !item.domain_code || item.domain_code === domainCode;

      let score = Math.max(
        nameTokenScore,
        childNameTokenScore,
        aliasScore * 0.98,
        childAliasScore * 0.98,
      );
      const reasons: string[] = [];

      if (technicalExact) {
        score = 1;
        reasons.push("exact technical identity match");
      } else if (!hasUnresolved && exact) {
        score = 1;
        reasons.push(names.includes(normalizedChildDescription) ? "exact child description match" : "exact canonical text match");
      } else if (!hasUnresolved && aliasExact) {
        score = Math.max(score, 0.99);
        reasons.push("exact verified alias match");
      } else {
        if (childNameTokenScore > 0) reasons.push(`child description similarity ${Math.round(childNameTokenScore * 100)}%`);
        if (nameTokenScore > 0) reasons.push(`combined description similarity ${Math.round(nameTokenScore * 100)}%`);
        if (aliasScore > 0) reasons.push(`alias similarity ${Math.round(aliasScore * 100)}%`);
      }

      if (attr.score > 0) {
        score = Math.min(1, score * 0.75 + attr.score * 0.25);
        reasons.push(...attr.reasons);
      }

      if (!domainMatch) {
        score *= 0.55;
        reasons.push("domain mismatch penalty");
      }

      if (hasUnresolved) {
        // UNKNOWN state: candidate has unresolved technical attributes (cannot be verified exact)
        score = Math.min(score, 0.78);
        const unresAttrs = compatibility.unresolved
          .map((u) => `${u.attribute} (${u.unresolvedSide === "master_missing" ? "missing on Master Item" : "missing on input"})`)
          .join(", ");
        reasons.push(`unresolved technical attribute(s): ${unresAttrs} - requires human verification`);
      }

      const isDraftItem = !Boolean(item.is_active) ||
        String(item.item_code || "").startsWith("DRAFT-") ||
        String(itemAttrs.catalog_status || "").toUpperCase() === "DRAFT";

      const method = technicalExact
        ? "technical_exact"
        : (!hasUnresolved && exact)
        ? "exact"
        : (!hasUnresolved && aliasExact)
        ? "alias_exact"
        : hasUnresolved
        ? "candidate"
        : attr.score > 0 && score >= 0.75
        ? "attribute"
        : score >= 0.75
        ? "normalized_similarity"
        : "candidate";

      return {
        inventory_item_id: item.id,
        item_code: item.item_code,
        name: item.name,
        description: item.description,
        base_uom_code: item.base_uom_code,
        domain_code: item.domain_code,
        identity_attributes: item.identity_attributes || {},
        is_draft: isDraftItem,
        item_status: isDraftItem ? "DRAFT" : "VERIFIED",
        confidence_score: Number(score.toFixed(4)),
        match_method: method,
        match_reasons: reasons,
      };
    })
    .filter((c: any) => c && c.confidence_score >= 0.35)
    .sort((a: any, b: any) => b.confidence_score - a.confidence_score)
    .slice(0, 10);

    const top = candidates[0] || null;
    const sourceType = body.source_type ? String(body.source_type) : null;
    const sourceId = uuidLike(body.source_id) ? body.source_id : null;
    const sourceLineId = uuidLike(body.source_line_id) ? body.source_line_id : null;

    if (candidates.length && sourceLineId) {
      const { error: clearPendingError } = await admin
        .from("mep_item_match_candidates")
        .delete()
        .eq("tenant_company_id", tenantCompanyId)
        .eq("source_line_id", sourceLineId)
        .eq("status", "pending");
      if (clearPendingError) throw new Error("Unable to refresh identification candidates: " + clearPendingError.message);

      const rows = candidates.map((c: any) => ({
        tenant_id: tenantId,
        tenant_company_id: tenantCompanyId,
        raw_description: rawDescription,
        normalized_description: normalizedDescription,
        parsed_attributes: parsedAttributes,
        candidate_inventory_item_id: c.inventory_item_id,
        match_method: c.match_method,
        confidence_score: c.confidence_score,
        match_reasons: c.match_reasons,
        source_type: sourceType,
        source_id: sourceId,
        source_line_id: sourceLineId,
        status: "pending",
        created_by: currentUser.id,
      }));

      await admin.from("mep_item_match_candidates").insert(rows);
    }

    return new Response(JSON.stringify({
      success: true,
      normalized_description: normalizedDescription,
      candidates,
      recommendation: top
        ? {
            inventory_item_id: top.inventory_item_id,
            confidence_score: top.confidence_score,
            match_method: top.match_method,
            match_reasons: top.match_reasons,
          }
        : null,
      requires_human_review: !top || top.confidence_score < 0.90,
      identity_context: {
        category_code: inputCategory,
        material: inputMaterial,
        dimension_mm: inputDimension ? Number(inputDimension) : null,
        uom_code: inputUom,
        technical_match_key: inputTechnicalKey,
      },
      ai_provider_used: null,
      note: "Deterministic identification engine. Commercial fields untouched. Human verification required."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
