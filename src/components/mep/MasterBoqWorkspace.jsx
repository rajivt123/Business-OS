import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Upload,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ListChecks,
  ArrowRight,
  Database,
  FileBarChart,
  HardDrive,
  LayoutGrid,
  Eye,
  Check,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useCrm } from "../../context/CrmContext";
import { useInventory } from "../../context/InventoryContext";
import { createBusinessAttachmentDownloadUrl } from "../../lib/storageService";
import * as XLSX from "xlsx";

const parseSupabaseError = async (err) => {
  if (!err) return "Unknown error occurred.";
  try {
    if (err?.context) {
      if (typeof err.context.json === "function") {
        const body = await err.context.json();
        if (body?.error) return body.error;
        if (body?.message) return body.message;
      }
      if (typeof err.context.text === "function") {
        const text = await err.context.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed?.error) return parsed.error;
          if (parsed?.message) return parsed.message;
        } catch (_) {
          if (text) return text;
        }
      }
    }
  } catch (_) {}
  return err?.error || err?.message || "Unknown error";
};

const formatConfidence = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0%";
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
};

export default function MasterBoqWorkspace({ isDarkMode = false }) {
  const crmContext = useCrm() || {};
  const { activeOperatingCompanyId, works = [] } = crmContext;

  const invContext = useInventory() || {};
  const { items = [], refreshAllInventory } = invContext;

  // View steps: 'SELECT_PROJECT' -> 'UPLOAD_SOURCE' -> 'MASTER_BOQ'
  const [currentView, setCurrentView] = useState("SELECT_PROJECT");

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDocs, setProjectDocs] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState("");

  // Data states
  const [boqLines, setBoqLines] = useState([]);
  const [currentMasterBoqId, setCurrentMasterBoqId] = useState(null);
  const [masterBoqStatus, setMasterBoqStatus] = useState(null);

  // Loaders and Errors
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [aiStatusMsg, setAiStatusMsg] = useState(null);

  // Review panel
  const [selectedLineForReview, setSelectedLineForReview] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationSearched, setIdentificationSearched] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [manualSelectedItemId, setManualSelectedItemId] = useState("");
  const [showChangeItem, setShowChangeItem] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (currentView === "SELECT_PROJECT") {
      setSelectedProject(null);
      setSelectedSourceId("");
      setBoqLines([]);
      setCurrentMasterBoqId(null);
      setMasterBoqStatus(null);
      setSelectedLineForReview(null);
      setCandidates([]);
      setIdentificationSearched(false);
      setErrorMsg(null);
    }
  }, [currentView]);

  const handleProjectSelect = async (workId) => {
    setSelectedProject(workId);
    setCurrentView("UPLOAD_SOURCE");
    setIsLoadingDocs(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("file_attachments")
        .select("*")
        .eq("tenant_company_id", activeOperatingCompanyId)
        .eq("entity_type", "work")
        .eq("entity_id", String(workId))
        .eq("field_key", "boq")
        .eq("is_current", true)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const workData = works.find((w) => w.id === workId);
      const docs = [];

      if (data && data.length > 0) {
        data.forEach((d) => {
          docs.push({
            type: "new",
            id: d.id,
            attachment: d,
          });
        });
      }
      if (workData && workData.boq_url) {
        docs.push({
          type: "legacy",
          id: "legacy_boq",
          boq_url: workData.boq_url,
        });
      }

      setProjectDocs(docs);
      if (docs.length > 0) {
        setSelectedSourceId(docs[0].id);
      } else {
        setSelectedSourceId("");
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleAIEntry = async () => {
    if (!selectedSourceId) {
      setErrorMsg("Please select a source document first.");
      return;
    }

    const workData = works.find((w) => w.id === selectedProject);
    const selectedDoc = projectDocs.find((d) => d.id === selectedSourceId);
    if (!selectedDoc && !workData?.boq_url) {
      setErrorMsg(
        "Please attach a BOQ document to this Work before using AI Entry.",
      );
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setAiStatusMsg("Reading BOQ locally…");

    try {
      let resolvedBoqUrl = "";
      let resolvedFileName = "BOQ";
      let resolvedMimeType = "application/pdf";

      if (selectedDoc?.type === "legacy" || selectedSourceId === "legacy_boq") {
        resolvedBoqUrl = selectedDoc?.boq_url || workData?.boq_url;
        let urlExt = "";
        try {
          const urlObj = new URL(resolvedBoqUrl);
          const rawName = urlObj.pathname.split("/").pop() || "";
          if (rawName.includes(".")) {
            urlExt = "." + rawName.split(".").pop();
          }
        } catch (_) {}
        resolvedFileName = `BOQ — Existing Legacy BOQ${urlExt}`;
        const lowerUrl = (resolvedBoqUrl || "").toLowerCase();
        if (lowerUrl.includes(".xlsx")) {
          resolvedMimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          if (!resolvedFileName.endsWith(".xlsx")) resolvedFileName += ".xlsx";
        } else if (lowerUrl.includes(".xls")) {
          resolvedMimeType = "application/vnd.ms-excel";
          if (!resolvedFileName.endsWith(".xls")) resolvedFileName += ".xls";
        } else if (lowerUrl.includes(".csv")) {
          resolvedMimeType = "text/csv";
          if (!resolvedFileName.endsWith(".csv")) resolvedFileName += ".csv";
        } else {
          resolvedMimeType = "application/pdf";
        }
      } else if (selectedDoc?.type === "new" && selectedDoc.attachment) {
        const { download_url } = await createBusinessAttachmentDownloadUrl({
          attachmentId: selectedDoc.attachment.id,
          entityType: "work",
          entityId: selectedProject,
          fieldKey: "boq",
        });
        resolvedBoqUrl = download_url;
        resolvedFileName = selectedDoc.attachment.file_name || "BOQ Document";
        resolvedMimeType =
          selectedDoc.attachment.mime_type || "application/octet-stream";
      } else if (workData?.boq_url) {
        resolvedBoqUrl = workData.boq_url;
        resolvedFileName = "BOQ — Existing Legacy BOQ";
        resolvedMimeType = "application/pdf";
      }

      if (!resolvedBoqUrl) {
        throw new Error("Unable to resolve BOQ document source URL.");
      }

      const isSpreadsheet =
        resolvedMimeType.includes("spreadsheet") ||
        resolvedMimeType.includes("excel") ||
        resolvedMimeType === "text/csv" ||
        resolvedFileName.toLowerCase().endsWith(".xlsx") ||
        resolvedFileName.toLowerCase().endsWith(".xls") ||
        resolvedFileName.toLowerCase().endsWith(".csv");
        
      if (!isSpreadsheet) {
        throw new Error("Local extraction for PDF/image documents is not available yet. Please use Manual Entry or select an Excel/CSV BOQ.");
      }

      // Call extraction service
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "mep-document-ai",
        {
          body: {
            action: "extract-master-boq",
            tenant_company_id: activeOperatingCompanyId,
            work_id: selectedProject,
            source_url: resolvedBoqUrl,
            source_file_name: resolvedFileName,
            mime_type: resolvedMimeType,
          },
        },
      );

      if (aiError) throw new Error(await parseSupabaseError(aiError));
      if (aiData?.error) throw new Error(aiData.error);
      if (!aiData?.success || !aiData?.extraction_id) {
        throw new Error(
          aiData?.message ||
            "Extraction failed to return valid extraction data.",
        );
      }

      const extractionId = aiData.extraction_id;
      const documentId = aiData.document_id;
      
      // Prepare inactive Draft Master Items from the extracted BOQ (do not activate automatically)
      setAiStatusMsg("Preparing Draft Master Items…");
      const { data: prepData, error: prepError } = await supabase.functions.invoke(
        "mep-item-identification",
        {
          body: {
            action: "prepare-master-items",
            tenant_company_id: activeOperatingCompanyId,
            extraction_id: extractionId,
          },
        },
      );

      if (prepError) throw new Error(await parseSupabaseError(prepError));
      if (prepData?.error) throw new Error(prepData.error);

      setAiStatusMsg("Extracting BOQ rows…");

      // 2. Fetch extracted lines from mep_extraction_lines
      const { data: extLines, error: linesError } = await supabase
        .from("mep_extraction_lines")
        .select("*")
        .eq("extraction_id", extractionId)
        .order("line_no", { ascending: true });

      if (linesError) {
        throw new Error(
          `Failed to query extraction lines: ${linesError.message}`,
        );
      }
      if (!extLines || extLines.length === 0) {
        throw new Error("No lines found in the extraction.");
      }
      
      setAiStatusMsg("Preparing Master BOQ…");

      // 3. Map actual mep_extraction_lines schema
      const mappedLines = extLines.map((l) => ({
        original_description: l.raw_description,
        normalized_description: l.normalized_description,
        quantity: l.quantity,
        uom_code: l.uom_code,
        make: l.make,
        model: l.model,
        specification: l.parsed_attributes,
        line_no: l.line_no,
        source_line_ref: l.source_line_ref,
        parent_line_ref: l.parent_line_no || l.parent_line_ref || "",
        line_type: l.line_type,
        procurement_scope: l.procurement_scope,
        supply_quantity: l.supply_quantity,
        supply_uom_code: l.supply_uom_code,
        supply_rate: l.supply_rate,
        supply_amount: l.supply_amount,
        installation_quantity: l.installation_quantity,
        installation_uom_code: l.installation_uom_code,
        installation_rate: l.installation_rate,
        installation_amount: l.installation_amount,
        line_total_amount: l.line_total_amount,
        source_po_number: l.source_po_number,
        source_wo_number: l.source_wo_number,
        inventory_item_id: l.candidate_inventory_item_id,
        match_confidence: l.match_confidence,
        match_method: l.match_method,
        match_explanation: l.match_reasons,
        source_extraction_line_id: l.id,
        source_page: l.source_page,
        source_section: l.source_section,
        material_code: l.material_code,
        hsn_code: l.hsn_code,
      }));

      // 4. Create Master BOQ draft (omit version so backend assigns next available version)
      const { data: createData, error: createError } =
        await supabase.functions.invoke("master-boq-service", {
          body: {
            action: "create",
            tenant_company_id: activeOperatingCompanyId,
            work_id: selectedProject,
            title: "AI Master BOQ",
            boq_code: "BOQ-" + Date.now(),
            source_extraction_id: extractionId,
            notes: "Created via local deterministic BOQ extraction",
            lines: mappedLines,
          },
        });

      if (createError) throw new Error(await parseSupabaseError(createError));
      if (createData?.error) throw new Error(createData.error);

      const masterBoqId = createData?.master_boq_id || createData?.boq_id;
      if (!masterBoqId)
        throw new Error("Backend did not return a master_boq_id.");

      setCurrentMasterBoqId(masterBoqId);
      setCurrentView("MASTER_BOQ");
      await fetchMasterBoq(masterBoqId);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsProcessing(false);
      setAiStatusMsg(null);
    }
  };

  const handleManualEntry = async () => {
    if (!selectedSourceId) {
      setErrorMsg("Please select a source document first.");
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const selectedDoc = projectDocs.find((d) => d.id === selectedSourceId);

      const { data: createData, error: createError } =
        await supabase.functions.invoke("master-boq-service", {
          body: {
            action: "create",
            tenant_company_id: activeOperatingCompanyId,
            work_id: selectedProject,
            title: "Manual Master BOQ",
            boq_code: "BOQ-" + Date.now(),
            source_document_id:
              selectedDoc?.type === "new" ? selectedDoc?.attachment?.id : null,
            source_extraction_id: null,
            notes: "Created via Manual Entry Workflow",
            lines: [],
          },
        });

      if (createError) throw new Error(await parseSupabaseError(createError));
      if (createData?.error) throw new Error(createData.error);

      const masterBoqId = createData?.master_boq_id || createData?.boq_id;
      if (!masterBoqId)
        throw new Error("Backend did not return a master_boq_id.");

      setCurrentMasterBoqId(masterBoqId);
      setCurrentView("MASTER_BOQ");
      await fetchMasterBoq(masterBoqId);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchMasterBoq = async (id) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "master-boq-service",
        {
          body: { action: "get", master_boq_id: id },
        },
      );
      if (error) throw new Error(await parseSupabaseError(error));
      if (data?.error) throw new Error(data.error);

      const rawLines = Array.isArray(data?.lines)
        ? data.lines
        : Array.isArray(data?.boq?.lines)
          ? data.boq.lines
          : [];

      setMasterBoqStatus(data?.boq?.status || "draft");

      // Query any inventory items not yet in memory so code resolution never fails
      const invIds = rawLines.map((l) => l.inventory_item_id).filter(Boolean);
      let loadedItems = [...(items || [])];
      const missingIds = invIds.filter((mId) => !loadedItems.some((i) => i.id === mId));
      if (missingIds.length > 0) {
        const { data: dbItems } = await supabase
          .from("inventory_items")
          .select("id, item_code, name, item_type, domain_code, hsn_code, base_uom_code, category")
          .in("id", missingIds);
        if (dbItems && dbItems.length > 0) {
          loadedItems = [...loadedItems, ...dbItems];
        }
      }

      const mappedLines = rawLines.map((l) => {
        const matchedItem = loadedItems.find((i) => i.id === l.inventory_item_id);
        const resolvedItemCode =
          matchedItem?.item_code ||
          l.master_item_code ||
          l.item_code ||
          (l.inventory_item && l.inventory_item.item_code) ||
          "";

        // Retain specificationObject as raw object
        const rawSpec = l.specification;
        const specObj =
          typeof rawSpec === "object" && rawSpec !== null
            ? rawSpec
            : typeof rawSpec === "string" && rawSpec.trim().startsWith("{")
              ? (() => {
                  try {
                    return JSON.parse(rawSpec);
                  } catch (_) {
                    return {};
                  }
                })()
              : {};

        const specText =
          typeof rawSpec === "object" && rawSpec !== null
            ? (rawSpec.raw_specification || JSON.stringify(rawSpec))
            : (rawSpec || "");

        // Protect human decisions: verified and rejected lines must not be overwritten
        const rawStatus = (l.match_status || "").toLowerCase();
        let resolvedStatus = "unmatched";
        if (rawStatus === "verified") {
          resolvedStatus = "verified";
        } else if (rawStatus === "rejected") {
          resolvedStatus = "rejected";
        } else if (rawStatus === "candidate") {
          resolvedStatus = "candidate";
        } else if (rawStatus === "matched" || (l.inventory_item_id && rawStatus !== "rejected" && rawStatus !== "unmatched")) {
          resolvedStatus = "matched";
        }

        return {
          id: l.id,
          lineNo: l.line_no || "",
          originalDescription: l.original_description || "",
          normalizedDescription: l.normalized_description || "",
          quantity: l.quantity || 0,
          uom: l.uom_code || "",
          make: l.make || "",
          model: l.model || "",
          specificationObject: specObj,
          specification: specText,
          specificationText: specText,
          masterItemCode: resolvedItemCode,
          itemType: matchedItem?.item_type || (l.inventory_item_id ? items.find((i) => i.id === l.inventory_item_id)?.item_type || "" : ""),
          domain: matchedItem?.domain_code || (l.inventory_item_id ? items.find((i) => i.id === l.inventory_item_id)?.domain_code || "" : ""),
          hsn: matchedItem?.hsn_code || (l.inventory_item_id ? items.find((i) => i.id === l.inventory_item_id)?.hsn_code || "" : ""),
          inventoryItemId: l.inventory_item_id,
          matchStatus: resolvedStatus,
          confidence: l.match_confidence || 0,
          matchMethod: l.match_method || "",
          matchReasons: l.match_explanation || "",
          supplyRate: l.supply_rate || 0,
          supplyAmount: l.supply_amount || 0,
          installationRate: l.installation_rate || 0,
          installationAmount: l.installation_amount || 0,
          lineTotalAmount: l.line_total_amount || 0,
          sourcePoNumber: l.source_po_number || "",
          sourceWoNumber: l.source_wo_number || "",
          lineType: l.line_type || "item",
          parentLineRef: l.parent_line_no || l.parent_line_ref || "",
          sourceLineRef: l.source_line_ref || "",
          procurementScope: l.procurement_scope || "",
          source_extraction_line_id: l.source_extraction_line_id || l.source_line_id || l.extraction_line_id || "",
        };
      });

      setBoqLines(mappedLines);

      // Refresh selected line if open
      if (selectedLineForReview) {
        const updated = mappedLines.find(
          (ml) => ml.id === selectedLineForReview.id,
        );
        setSelectedLineForReview(updated || null);
      }
    } catch (e) {
      setErrorMsg("Failed to fetch BOQ: " + e.message);
    }
  };

  const resolveParentDescription = (line) => {
    if (!line) return "";

    const cleanStr = (val) => (typeof val === "string" ? val.trim() : "");

    // Priority B: line.specification.parent_description / line.specificationObject.parent_description
    const specObj =
      line.specificationObject && typeof line.specificationObject === "object"
        ? line.specificationObject
        : typeof line.specification === "object" && line.specification !== null
          ? line.specification
          : typeof line.specification === "string" && line.specification.trim().startsWith("{")
            ? (() => {
                try {
                  return JSON.parse(line.specification);
                } catch (_) {
                  return {};
                }
              })()
            : {};

    const parentDescFromSpec = cleanStr(specObj.parent_description);
    if (parentDescFromSpec) {
      return parentDescFromSpec;
    }

    // Priority C: line.specification.parent_context.description
    const parentContextDesc = cleanStr(
      typeof specObj.parent_context === "object" && specObj.parent_context !== null
        ? specObj.parent_context.description
        : specObj.parent_context
    );
    if (parentContextDesc) {
      return parentContextDesc;
    }

    // Priority D: find parent using line.parentLineRef against line.lineNo, line.sourceLineRef, parent line reference
    const ref = cleanStr(line.parentLineRef || line.parent_line_ref || line.parent_line_no);
    if (ref && Array.isArray(boqLines) && boqLines.length > 0) {
      const parent = boqLines.find((l) => {
        if (l.id === line.id) return false;
        const lLineNo = cleanStr(l.lineNo || l.line_no);
        const lSourceRef = cleanStr(l.sourceLineRef || l.source_line_ref);
        const lParentRef = cleanStr(l.parentLineRef || l.parent_line_ref);
        const lExtractionId = cleanStr(l.source_extraction_line_id);
        const lId = cleanStr(l.id);

        return (
          (lLineNo && lLineNo === ref) ||
          (lSourceRef && lSourceRef === ref) ||
          (lParentRef && lParentRef === ref) ||
          (lExtractionId && lExtractionId === ref) ||
          (lId && lId === ref)
        );
      });

      if (parent) {
        const parentOrig = cleanStr(parent.originalDescription || parent.original_description);
        if (parentOrig) {
          return parentOrig;
        }
      }
    }

    return "";
  };

  const resolveTechnicalContext = (line) => {
    if (!line) return "";
    const orig = (line.originalDescription || line.original_description || line.raw_description || "").trim();
    const parentDesc = resolveParentDescription(line);

    // Priority E: If no parent exists, use line.originalDescription only.
    if (!parentDesc) {
      return orig;
    }

    if (!orig) {
      return parentDesc;
    }

    // Priority A: If line.originalDescription already contains the full parent technical description, use it directly.
    const normOrig = orig.toLowerCase().replace(/\s+/g, " ");
    const normParent = parentDesc.toLowerCase().replace(/\s+/g, " ");

    if (normOrig.includes(normParent)) {
      return orig;
    }

    // Never duplicate the parent description: "Parent — Child"
    return `${parentDesc} — ${orig}`;
  };

  const getParentDescription = (line) => {
    const p = resolveParentDescription(line);
    return p || null;
  };

  const handleStartIdentification = async (line) => {
    if (!line) return;
    setIsIdentifying(true);
    setCandidates([]);
    setIdentificationSearched(false);
    setErrorMsg(null);
    try {
      const technicalContext = resolveTechnicalContext(line);
      const parentDesc = resolveParentDescription(line);

      const { data, error } = await supabase.functions.invoke(
        "mep-item-identification",
        {
          body: {
            action: "identify",
            tenant_company_id: activeOperatingCompanyId,
            raw_description: technicalContext,
            parsed_attributes: {
              ...(line.specificationObject || {}),
              parent_description: parentDesc || null,
              parent_context: {
                description: parentDesc || null,
              },
              source_child_description: line.originalDescription,
              source_uom: line.uom,
              source_quantity: line.quantity,
              source_line_no: line.lineNo,
            },
            domain_code: "FIRE_FIGHTING",
            source_type: "master_boq",
            source_id: currentMasterBoqId,
            source_line_id: line.source_extraction_line_id || line.id,
            include_drafts: true,
            uom_code: line.uom,
          },
        },
      );
      if (error) throw new Error(await parseSupabaseError(error));
      if (data?.error) throw new Error(data.error);

      setCandidates(data.candidates || []);
      setIdentificationSearched(true);
    } catch (e) {
      setErrorMsg("Identification failed: " + e.message);
      setIdentificationSearched(true);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleAcceptCandidate = async (selectedCandidate) => {
    if (!selectedLineForReview || !selectedCandidate) return;
    const line = selectedLineForReview;
    const selectedInventoryItemId =
      selectedCandidate.inventory_item_id || selectedCandidate.id;
    const confScore =
      selectedCandidate.confidence_score ?? selectedCandidate.confidence ?? 0;
    const matchMethod =
      selectedCandidate.match_method ||
      selectedCandidate.method ||
      "Deterministic / Semantic";
    const matchReasons =
      selectedCandidate.match_reasons ||
      selectedCandidate.match_explanation ||
      selectedCandidate.reasons ||
      "";
    const normDesc =
      selectedCandidate.normalized_description ||
      selectedCandidate.item_name ||
      line.normalizedDescription;

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // 1. First: mep-item-identification -> review -> accepted
      const { data: reviewData, error: reviewError } =
        await supabase.functions.invoke("mep-item-identification", {
          body: {
            action: "review",
            decision: "accepted",
            inventory_item_id: selectedInventoryItemId,
            source_line_id: line.source_extraction_line_id || line.id,
            tenant_company_id: activeOperatingCompanyId,
            confidence_score: confScore,
          },
        });
      if (reviewError) throw new Error(await parseSupabaseError(reviewError));
      if (reviewData?.error) throw new Error(reviewData.error);

      const resolvedInventoryItemId =
        reviewData?.inventory_item_id || selectedInventoryItemId;

      // 2. Second: master-boq-service update-line operation
      const { data: updateData, error: updateError } =
        await supabase.functions.invoke("master-boq-service", {
          body: {
            action: "update-line",
            master_boq_line_id: line.id,
            inventory_item_id: resolvedInventoryItemId,
            normalized_description: normDesc,
            specification: line.specification,
            make: line.make,
            model: line.model,
            quantity: line.quantity,
            uom_code: line.uom,
            remarks: "",
            match_method: matchMethod,
            match_confidence: confScore,
            match_explanation: matchReasons,
            decision: "verify",
          },
        });
      if (updateError) throw new Error(await parseSupabaseError(updateError));
      if (updateData?.error) throw new Error(updateData.error);

      if (refreshAllInventory) {
        refreshAllInventory(activeOperatingCompanyId);
      }
      await fetchMasterBoq(currentMasterBoqId);
      setCandidates([]);
      setIdentificationSearched(false);
      setShowChangeItem(false);
      setManualSelectedItemId("");
    } catch (e) {
      setErrorMsg("Candidate verification failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualChangeItem = async () => {
    if (!selectedLineForReview || !manualSelectedItemId) return;
    const line = selectedLineForReview;
    const selectedItem = items.find((i) => i.id === manualSelectedItemId);

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // 1. First: mep-item-identification -> review -> corrected
      const { data: reviewData, error: reviewError } =
        await supabase.functions.invoke("mep-item-identification", {
          body: {
            action: "review",
            decision: "corrected",
            inventory_item_id: manualSelectedItemId,
            source_line_id: line.source_extraction_line_id || line.id,
            tenant_company_id: activeOperatingCompanyId,
            confidence_score: 1.0,
          },
        });
      if (reviewError) throw new Error(await parseSupabaseError(reviewError));
      if (reviewData?.error) throw new Error(reviewData.error);

      const resolvedInventoryItemId =
        reviewData?.inventory_item_id || manualSelectedItemId;

      // 2. Second: master-boq-service update-line operation
      const { data: updateData, error: updateError } =
        await supabase.functions.invoke("master-boq-service", {
          body: {
            action: "update-line",
            master_boq_line_id: line.id,
            inventory_item_id: resolvedInventoryItemId,
            normalized_description:
              selectedItem?.name || line.normalizedDescription,
            specification: line.specification,
            make: line.make,
            model: line.model,
            quantity: line.quantity,
            uom_code: line.uom,
            remarks: "Manual override",
            match_method: "Manual",
            match_confidence: 1.0,
            match_explanation: "User selected item manually",
            decision: "verify",
          },
        });
      if (updateError) throw new Error(await parseSupabaseError(updateError));
      if (updateData?.error) throw new Error(updateData.error);

      if (refreshAllInventory) {
        refreshAllInventory(activeOperatingCompanyId);
      }
      await fetchMasterBoq(currentMasterBoqId);
      setCandidates([]);
      setIdentificationSearched(false);
      setShowChangeItem(false);
      setManualSelectedItemId("");
    } catch (e) {
      setErrorMsg("Manual item update failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateLine = async (
    lineId,
    inventoryItemId,
    decision,
    conf = 0,
    method = "",
    reasons = "",
    overrideNormDesc = "",
  ) => {
    try {
      const lineData = boqLines.find((l) => l.id === lineId);
      if (!lineData) return;

      setIsProcessing(true);
      setErrorMsg(null);

      const { data, error } = await supabase.functions.invoke(
        "master-boq-service",
        {
          body: {
            action: "update-line",
            master_boq_line_id: lineId,
            inventory_item_id: inventoryItemId,
            normalized_description:
              overrideNormDesc || lineData.normalizedDescription,
            specification: lineData.specification,
            make: lineData.make,
            model: lineData.model,
            quantity: lineData.quantity,
            uom_code: lineData.uom,
            remarks: "",
            match_method: method,
            match_confidence: conf,
            match_explanation: reasons,
            decision: decision,
          },
        },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await fetchMasterBoq(currentMasterBoqId);
      setCandidates([]);
      setIdentificationSearched(false);
      setShowChangeItem(false);
      setManualSelectedItemId("");
    } catch (e) {
      setErrorMsg("Update failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const { data, error } = await supabase.functions.invoke(
        "master-boq-service",
        {
          body: { action: "approve", master_boq_id: currentMasterBoqId },
        },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await fetchMasterBoq(currentMasterBoqId);
    } catch (e) {
      setErrorMsg("Approval failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReprocessUnmatched = async () => {
    if (!currentMasterBoqId) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Preferred architecture (Part 7): Filter only unresolved lines (unmatched, candidate)
      // Strictly protect VERIFIED and REJECTED lines from being sent or reprocessed.
      const unresolvedLines = lines.filter(l => {
        const type = String(l.lineType || "item").toLowerCase();
        if (type === "section" || type === "header") return false;
        const status = String(l.matchStatus || "unmatched").toLowerCase();
        return status !== "verified" && status !== "rejected";
      });

      if (unresolvedLines.length === 0) {
        setAiStatusMsg("All items are already verified or rejected. Nothing to reprocess.");
        setTimeout(() => setAiStatusMsg(null), 3000);
        setIsProcessing(false);
        return;
      }

      setAiStatusMsg(`Identified ${unresolvedLines.length} unresolved items to process (verified/rejected lines protected)...`);

      const batchSize = 50;

      for (let i = 0; i < unresolvedLines.length; i += batchSize) {
        const chunk = unresolvedLines.slice(i, i + batchSize).map(l => l.id);
        const from = i + 1;
        const to = Math.min(i + batchSize, unresolvedLines.length);
        setAiStatusMsg(`Matching BOQ items ${from}–${to} of ${unresolvedLines.length}...`);

        const { data, error } = await supabase.functions.invoke(
          "mep-item-identification",
          {
            body: {
              action: "reprocess-master-boq",
              tenant_company_id: activeOperatingCompanyId,
              master_boq_id: currentMasterBoqId,
              line_ids: chunk,
              include_drafts: true,
            },
          },
        );

        if (error) throw new Error(await parseSupabaseError(error));
        if (data?.error) throw new Error(data.error);
      }

      setAiStatusMsg("Refreshing Master BOQ…");
      await fetchMasterBoq(currentMasterBoqId);
    } catch (e) {
      setErrorMsg("Reprocessing failed: " + e.message);
    } finally {
      setIsProcessing(false);
      setAiStatusMsg(null);
    }
  };

  const isBillableItem = (line) => {
    if (line.lineType === "section" || line.lineType === "header") return false;
    const hasQty = line.quantity !== 0 && line.quantity !== null && line.quantity !== "";
    const hasUom = !!line.uom;
    const hasSupply = !!line.supplyRate || !!line.supplyAmount;
    const hasInstall = !!line.installationRate || !!line.installationAmount;
    const hasTotal = !!line.lineTotalAmount;
    
    if (!hasQty && !hasUom && !hasSupply && !hasInstall && !hasTotal) {
      return false;
    }
    return true;
  };

  const exportCommercial = (type) => {
    const data = [];
    const billableLines = boqLines.filter(isBillableItem);
    let totalSupply = 0;
    let totalInstallation = 0;
    let grandTotal = 0;

    billableLines.forEach(l => {
      const parentDesc = getParentDescription(l);
      const fullDesc = parentDesc ? `${parentDesc}\n${l.originalDescription}` : l.originalDescription;
      
      const row = {
        "Line No": l.lineNo,
        "Description": fullDesc,
        "Qty": l.quantity,
        "UOM": l.uom,
      };

      if (type === 'supply' || type === 'combined') {
        row["Supply Rate"] = l.supplyRate;
        row["Supply Amount"] = l.supplyAmount;
        totalSupply += (l.supplyAmount || 0);
      }
      
      if (type === 'installation' || type === 'combined') {
        row["Installation Rate"] = l.installationRate;
        row["Installation Amount"] = l.installationAmount;
        totalInstallation += (l.installationAmount || 0);
      }

      if (type === 'combined') {
        row["Total Amount"] = l.lineTotalAmount;
        grandTotal += (l.lineTotalAmount || 0);
      }

      row["PO Reference"] = l.sourcePoNumber || "";
      row["WO Reference"] = l.sourceWoNumber || "";
      
      data.push(row);
    });

    const totalsRow = {
      "Line No": "",
      "Description": "TOTAL",
      "Qty": "",
      "UOM": "",
    };
    
    if (type === 'supply' || type === 'combined') {
      totalsRow["Supply Rate"] = "";
      totalsRow["Supply Amount"] = totalSupply;
    }
    if (type === 'installation' || type === 'combined') {
      totalsRow["Installation Rate"] = "";
      totalsRow["Installation Amount"] = totalInstallation;
    }
    if (type === 'combined') {
      totalsRow["Total Amount"] = grandTotal;
    }
    totalsRow["PO Reference"] = "";
    totalsRow["WO Reference"] = "";

    data.push(totalsRow);

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master BOQ");
    
    const filename = `Master_BOQ_${type}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const filteredLines = useMemo(() => {
    return boqLines.filter((line) => {
      if (statusFilter !== "ALL" && line.matchStatus !== statusFilter)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          line.originalDescription?.toLowerCase().includes(q) ||
          line.lineNo?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [boqLines, statusFilter, searchQuery]);

  const StatusBadge = ({ status, confidence }) => {
    const s = (status || "unmatched").toLowerCase();
    const isMatched = s === "matched" || s === "verified";

    if (isMatched) {
      return (
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border uppercase bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
            MATCHED
          </span>
          {confidence !== undefined &&
            confidence !== null &&
            Number(confidence) > 0 && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                {formatConfidence(confidence)}
              </span>
            )}
        </div>
      );
    }

    const config = {
      unmatched:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      candidate:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
      rejected:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    };
    const c = config[s] || config.unmatched;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase ${c}`}
      >
        {status || "unmatched"}
      </span>
    );
  };

  const selectedWorkTitle =
    works.find((w) => w.id === selectedProject)?.title || selectedProject;
  const selectedDocTitle =
    projectDocs.find((d) => d.id === selectedSourceId)?.attachment?.file_name ||
    "Legacy BOQ";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Master BOQ
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
              {currentView !== "SELECT_PROJECT" && (
                <span>{selectedWorkTitle}</span>
              )}
              {currentView === "MASTER_BOQ" && selectedSourceId && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{selectedDocTitle}</span>
                </>
              )}
              {masterBoqStatus === "APPROVED" && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
                    MASTER BOQ APPROVED
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentView === "MASTER_BOQ" && (
              <>
                <div className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors flex items-center gap-2">
                    Commercial Output <ChevronRight className="w-3 h-3 rotate-90" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-200 dark:border-slate-700 flex flex-col py-1">
                    <button onClick={() => exportCommercial('supply')} className="text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">PO – Supply</button>
                    <button onClick={() => exportCommercial('installation')} className="text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">WO – Installation</button>
                    <button onClick={() => exportCommercial('combined')} className="text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">PO – Combined</button>
                  </div>
                </div>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing || masterBoqStatus === "APPROVED"}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Approve Master BOQ"}
                </button>
              </>
            )}
          </div>
        </div>
        {aiStatusMsg && currentView === "MASTER_BOQ" && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin flex-none" />
            <span className="flex-1 font-medium">{aiStatusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex relative">
        {currentView === "SELECT_PROJECT" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4 flex-none">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Select Project
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-none">
                Choose a project to begin building or reviewing its Master BOQ.
              </p>
              <div className="space-y-2 overflow-auto flex-1">
                {works.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No projects found.
                  </p>
                ) : (
                  works.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleProjectSelect(w.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {w.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select to choose document
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === "UPLOAD_SOURCE" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <FileBarChart className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Source BOQ Document
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Select a document (Final BOQ, Client PO, etc.) from the project
                attachments.
              </p>

              {isLoadingDocs ? (
                <div className="py-8 flex justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="mb-6 space-y-4">
                  {projectDocs.length === 0 && (
                    <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      No BOQ document attached to this project.
                    </div>
                  )}
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Source Document --</option>
                    {projectDocs.map((doc) => {
                      if (doc.type === "legacy") {
                        return (
                          <option key={doc.id} value={doc.id}>
                            BOQ — Existing Legacy BOQ
                          </option>
                        );
                      }

                      const d = doc.attachment;
                      const sizeMB = d.file_size_bytes
                        ? (d.file_size_bytes / 1024 / 1024).toFixed(2) + " MB"
                        : "";
                      const mime = d.mime_type
                        ? d.mime_type.split("/").pop().toUpperCase()
                        : "FILE";
                      const label = `BOQ — ${d.file_name} ${sizeMB ? `(${sizeMB}, ${mime})` : ""}`;
                      return (
                        <option key={doc.id} value={doc.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleManualEntry}
                  disabled={!selectedSourceId || isProcessing}
                  className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  Manual Entry
                </button>
                <button
                  onClick={handleAIEntry}
                  disabled={!selectedSourceId || isProcessing}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {aiStatusMsg || "Processing..."}
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      AI Entry
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setCurrentView("SELECT_PROJECT")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === "MASTER_BOQ" && (
          <div className="flex-1 min-h-0 flex overflow-hidden relative">
            {/* BOQ Grid */}
            <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900">
              <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search descriptions, lines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-100"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="unmatched">Unmatched</option>
                  <option value="candidate">Candidate</option>
                  <option value="matched">Matched</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="flex-1" />
                {masterBoqStatus !== "APPROVED" && (
                  <>
                    <button
                      onClick={handleReprocessUnmatched}
                      disabled={isProcessing}
                      className="px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                      title="Reprocess Unmatched Items via mep-item-identification"
                    >
                      <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                      Reprocess Unmatched Items
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Line
                    </button>
                  </>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Line No
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[240px]">
                        Description
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        UOM
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Supply Rate
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Supply Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Installation Rate
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Installation Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Total
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        PO/WO Reference
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Master Item
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Match Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLines.filter(isBillableItem).length === 0 ? (
                      <tr>
                        <td
                          colSpan="13"
                          className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                        >
                          <LayoutGrid className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                            No lines available
                          </p>
                          <p className="text-sm mt-1">
                            Manual entry mode or no lines extracted.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredLines.filter(isBillableItem).map((line) => (
                        <tr
                          key={line.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedLineForReview?.id === line.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                        >
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">
                            {line.lineNo}
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-sm"
                            title={line.originalDescription}
                          >
                            {resolveParentDescription(line) && !line.originalDescription?.toLowerCase().includes(resolveParentDescription(line).toLowerCase()) && (
                              <div className="text-xs text-slate-400 mb-1 truncate font-medium" title={resolveParentDescription(line)}>
                                {resolveParentDescription(line)}
                              </div>
                            )}
                            <div className="truncate">{line.originalDescription}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {line.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {line.uom}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                            {line.supplyRate || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                            {line.supplyAmount || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                            {line.installationRate || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                            {line.installationAmount || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap font-mono">
                            {line.lineTotalAmount || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {(line.sourcePoNumber || line.sourceWoNumber) ? (
                              <div className="flex flex-col gap-0.5">
                                {line.sourcePoNumber && <span className="text-xs text-slate-500 font-mono">PO: {line.sourcePoNumber}</span>}
                                {line.sourceWoNumber && <span className="text-xs text-slate-500 font-mono">WO: {line.sourceWoNumber}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap">
                            {line.masterItemCode || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <StatusBadge status={line.matchStatus} confidence={line.confidence} />
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedLineForReview(line);
                                setShowChangeItem(false);
                                setManualSelectedItemId("");
                                if (line.matchStatus !== "matched" && line.matchStatus !== "verified") {
                                  handleStartIdentification(line);
                                } else {
                                  setCandidates([]);
                                  setIdentificationSearched(false);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              title="Review Match"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Review Match Drawer (Right-side overlay/drawer, does not shrink main table) */}
            {selectedLineForReview && (
              <div className="absolute top-0 right-0 bottom-0 w-[400px] max-w-[90vw] z-30 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex-none px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        Review Match
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Line #{selectedLineForReview.lineNo}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLineForReview(null);
                      setCandidates([]);
                      setIdentificationSearched(false);
                      setShowChangeItem(false);
                      setManualSelectedItemId("");
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Close drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 overscroll-contain">
                  {/* Original Content */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Original BOQ Text
                    </h4>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                      {resolveTechnicalContext(selectedLineForReview)}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Line No
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {selectedLineForReview.lineNo}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Qty / UOM
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {selectedLineForReview.quantity}{" "}
                          {selectedLineForReview.uom}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation / Identification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Document AI Identification
                      </h4>
                      {selectedLineForReview.matchStatus !== "matched" &&
                        selectedLineForReview.matchStatus !== "verified" &&
                        !isIdentifying && (
                          <button
                            onClick={() =>
                              handleStartIdentification(selectedLineForReview)
                            }
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                          >
                            <HardDrive className="w-3 h-3" />
                            {identificationSearched ? "Re-run AI Match" : "Start AI Match"}
                          </button>
                        )}
                    </div>

                    {isIdentifying && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mb-2" />
                        <span className="text-xs text-slate-500">
                          Querying AI model...
                        </span>
                      </div>
                    )}

                    {!isIdentifying && candidates.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 px-1">
                          Candidates suggested by AI:
                        </p>
                        {candidates.map((c, i) => {
                          const isDraft =
                            c.is_draft === true ||
                            String(c.item_code || "").startsWith("DRAFT-") ||
                            String(c.item_status || "").toUpperCase() === "DRAFT" ||
                            String(c.status || "").toUpperCase() === "DRAFT";

                          const statusLabel = isDraft
                            ? "Draft"
                            : String(c.item_status || c.status || "").toUpperCase() === "VERIFIED"
                              ? "Verified"
                              : "Active";

                          const itemCode = c.item_code || c.master_item_code || "Unknown Code";
                          const itemName =
                            c.identity_attributes?.technical_identity_text ||
                            c.technical_identity_text ||
                            c.name ||
                            c.item_name ||
                            c.master_item_name ||
                            "Unknown Item";

                          const technicalQualifiers =
                            c.identity_attributes?.technical_qualifiers ||
                            c.technical_qualifiers;

                          let qualifiersDisplay = "";
                          if (technicalQualifiers) {
                            if (typeof technicalQualifiers === "string") {
                              qualifiersDisplay = technicalQualifiers;
                            } else if (Array.isArray(technicalQualifiers)) {
                              qualifiersDisplay = technicalQualifiers.filter(Boolean).join(", ");
                            } else if (typeof technicalQualifiers === "object" && technicalQualifiers !== null) {
                              qualifiersDisplay = Object.entries(technicalQualifiers)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ");
                            }
                          }

                          const category = c.category || c.item_category || c.domain_code || c.domain || "—";
                          const uom = c.uom || c.uom_code || c.base_uom_code || "—";
                          const confidence = c.confidence_score ?? c.confidence ?? 0;
                          const matchMethod = c.match_method || c.method || "—";
                          const matchReasons = c.match_reasons || c.match_explanation || c.reasons || "";

                          return (
                            <div
                              key={c.inventory_item_id || c.id || i}
                              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                                      {itemCode}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                                        isDraft
                                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                          : statusLabel === "Verified"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                      }`}
                                    >
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {itemName}
                                  </div>
                                  {qualifiersDisplay && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {qualifiersDisplay}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded font-mono flex-none">
                                  {formatConfidence(confidence)}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700/60">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Category</div>
                                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5" title={category}>
                                    {category}
                                  </div>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700/60">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">UOM</div>
                                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                                    {uom}
                                  </div>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700/60">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Match Method</div>
                                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5" title={matchMethod}>
                                    {matchMethod}
                                  </div>
                                </div>
                              </div>

                              {matchReasons && (
                                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">Match Reasons: </span>
                                  {matchReasons}
                                </div>
                              )}

                              <button
                                onClick={() => handleAcceptCandidate(c)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Accept Master Item
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!isIdentifying &&
                      identificationSearched &&
                      candidates.length === 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 text-center space-y-3">
                          <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            No matching Master Item found — manual selection required.
                          </div>
                          <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                            No matching master item candidates were returned by Document AI.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowChangeItem(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            <ListChecks className="w-3.5 h-3.5" />
                            Select Existing Master Item
                          </button>
                        </div>
                      )}

                    {!isIdentifying &&
                      !identificationSearched &&
                      candidates.length === 0 &&
                      (selectedLineForReview.matchStatus === "matched" ||
                        selectedLineForReview.matchStatus === "verified" ||
                        selectedLineForReview.inventoryItemId) && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/40">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              Matched Master Item
                            </span>
                            {selectedLineForReview.confidence > 0 && (
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-mono">
                                {formatConfidence(selectedLineForReview.confidence)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-2">
                            {selectedLineForReview.masterItemCode}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {selectedLineForReview.normalizedDescription}
                          </div>
                          <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs text-slate-500">
                            <span>Method: {selectedLineForReview.matchMethod || "Verified"}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">MATCHED</span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  {masterBoqStatus !== "APPROVED" && (
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {!showChangeItem ? (
                        <>
                          <button
                            onClick={() => setShowChangeItem(true)}
                            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
                          >
                            Change Master Item (Manual)
                          </button>

                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleUpdateLine(
                                  selectedLineForReview.id,
                                  null,
                                  "reject",
                                )
                              }
                              className="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                            <button className="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm">
                              Req. New Item
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Select Canonical Master Item
                          </label>
                          <select
                            value={manualSelectedItemId}
                            onChange={(e) =>
                              setManualSelectedItemId(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-900 dark:text-slate-100"
                          >
                            <option value="">-- Choose Item --</option>
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.item_code} - {i.item_name || i.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleManualChangeItem}
                              disabled={!manualSelectedItemId || isProcessing}
                              className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Verify Selection
                            </button>
                            <button
                              onClick={() => setShowChangeItem(false)}
                              className="py-1.5 px-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
