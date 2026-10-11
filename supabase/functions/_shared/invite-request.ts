export type InviteRequestBody = {
  email?: unknown;
  role?: unknown;
  tenant_id?: unknown;
  tenant_company_id?: unknown;
};

export type InviteBodyParseResult =
  | { ok: true; body: InviteRequestBody }
  | { ok: false; status: 400 | 413; error: string };

export function parseInviteRequestBody(rawBody: ArrayBuffer): InviteBodyParseResult {
  if (rawBody.byteLength > 16_384) {
    return { ok: false, status: 413, error: "Request body exceeds 16 KiB" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body" };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, status: 400, error: "Request body must be a JSON object" };
  }

  return { ok: true, body: parsed as InviteRequestBody };
}
