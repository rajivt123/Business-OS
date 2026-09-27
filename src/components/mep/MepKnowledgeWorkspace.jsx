import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Brain,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Layers,
  Info,
  Cpu,
  Eye,
  History,
  Upload,
  Download,
  Sparkles,
  Ban,
  Play,
  FileCode2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCrm, getUserDisplayName } from '../../context/CrmContext';
import { useInventory } from '../../context/InventoryContext';
import { createBusinessAttachmentDownloadUrl, formatBytes } from '../../lib/storageService';
import {
  prepareInitialDocumentExtractionJob,
  executeExtractionJob,
  cancelExtractionJob,
  ACTIVE_EXTRACTION_STATUSES
} from '../../lib/mepExtractionService';
import LineDetailModal from './LineDetailModal';
import RawExtractionModal from './RawExtractionModal';
import MepDocumentIngestionWorkspace from './MepDocumentIngestionWorkspace';

export default function MepKnowledgeWorkspace({ isDarkMode = false }) {
  // Scoping & context
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    profiles = [],
    tenantMembers = [],
    currentUser,
    session
  } = crmContext;

  const authUserId = session?.user?.id || currentUser?.id;

  const invContext = useInventory() || {};
  const {
    items = [],
    mepDomains = [],
    mepCategories = []
  } = invContext;

  // Workspace Data State
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [extractions, setExtractions] = useState([]);
  const [extractionLines, setExtractionLines] = useState([]);
  const [aiCorrections, setAiCorrections] = useState([]);

  // Loading & Error States
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Document Filters (View 1)
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [filterDocType, setFilterDocType] = useState('ALL');
  const [filterIngestionStatus, setFilterIngestionStatus] = useState('ALL');
  const [filterAuthoritative, setFilterAuthoritative] = useState('ALL'); // 'ALL' | 'AUTH' | 'STANDARD'

  // Sub-view inside Document Detail
  const [activeDocTab, setActiveDocTab] = useState('lines'); // 'lines' | 'extractions' | 'corrections'

  // Line Filters (View 4)
  const [selectedExtractionFilter, setSelectedExtractionFilter] = useState('ALL');
  const [searchLineQuery, setSearchLineQuery] = useState('');
  const [filterLineReviewStatus, setFilterLineReviewStatus] = useState('ALL');
  const [filterLineDomain, setFilterLineDomain] = useState('ALL');

  // Line Detail Modal (View 5 & 6)
  const [selectedLineForModal, setSelectedLineForModal] = useState(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);

  // Ingestion Workspace View (Step 2 & 8)
  const [isIngesting, setIsIngesting] = useState(false);
  const [isPreparingJob, setIsPreparingJob] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Raw Extraction Envelope Modal (Phase 4A)
  const [selectedRawEnvelope, setSelectedRawEnvelope] = useState(null);
  const [selectedExtractionJobForModal, setSelectedExtractionJobForModal] = useState(null);
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isExecutingWorker, setIsExecutingWorker] = useState(false);
  const [executingJobId, setExecutingJobId] = useState(null);

  // -------------------------------------------------------------
  // FETCHERS (Company Scoped & Read-Only Inspection)
  // -------------------------------------------------------------
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    setErrorMsg(null);
    try {
      let query = supabase
        .from('mep_document_examples')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOperatingCompanyId) {
        query = query.eq('tenant_company_id', activeOperatingCompanyId);
      } else if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error fetching documents:', err);
      setErrorMsg(err.message || 'Failed to load MEP document examples.');
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [activeOperatingCompanyId, tenantId]);

  // Initial load or company change
  useEffect(() => {
    fetchDocuments();
    setSelectedDocId(null);
    setExtractions([]);
    setExtractionLines([]);
    setAiCorrections([]);
  }, [fetchDocuments]);

  // Fetch details when a document is selected
  const fetchDocumentDetails = useCallback(async (docId) => {
    if (!docId) return;
    setIsLoadingDetails(true);
    setErrorMsg(null);

    try {
      // 1. Extractions for this document
      let extQuery = supabase
        .from('mep_document_extractions')
        .select('*')
        .eq('document_example_id', docId)
        .order('created_at', { ascending: false });

      if (activeOperatingCompanyId) {
        extQuery = extQuery.eq('tenant_company_id', activeOperatingCompanyId);
      } else if (tenantId) {
        extQuery = extQuery.eq('tenant_id', tenantId);
      }

      const { data: extData, error: extErr } = await extQuery;
      if (extErr) throw extErr;
      const loadedExtractions = extData || [];
      setExtractions(loadedExtractions);

      // 2. Extraction lines
      const extractionIds = loadedExtractions.map(e => e.id);
      if (extractionIds.length === 0) {
        setExtractionLines([]);
        setAiCorrections([]);
        setIsLoadingDetails(false);
        return;
      }

      let linesQuery = supabase
        .from('mep_extraction_lines')
        .select('*')
        .in('extraction_id', extractionIds)
        .order('line_no', { ascending: true });

      if (activeOperatingCompanyId) {
        linesQuery = linesQuery.eq('tenant_company_id', activeOperatingCompanyId);
      } else if (tenantId) {
        linesQuery = linesQuery.eq('tenant_id', tenantId);
      }

      const { data: linesData, error: linesErr } = await linesQuery;
      if (linesErr) throw linesErr;
      const loadedLines = linesData || [];
      setExtractionLines(loadedLines);

      // 3. AI corrections for these lines
      const lineIds = loadedLines.map(l => l.id);
      if (lineIds.length === 0) {
        setAiCorrections([]);
        setIsLoadingDetails(false);
        return;
      }

      let corrQuery = supabase
        .from('mep_ai_corrections')
        .select('*')
        .in('extraction_line_id', lineIds)
        .order('created_at', { ascending: false });

      if (activeOperatingCompanyId) {
        corrQuery = corrQuery.eq('tenant_company_id', activeOperatingCompanyId);
      } else if (tenantId) {
        corrQuery = corrQuery.eq('tenant_id', tenantId);
      }

      const { data: corrData, error: corrErr } = await corrQuery;
      if (corrErr) throw corrErr;
      setAiCorrections(corrData || []);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error loading document details:', err);
      setErrorMsg(err.message || 'Failed to load extraction details.');
    } finally {
      setIsLoadingDetails(false);
    }
  }, [activeOperatingCompanyId, tenantId]);

  useEffect(() => {
    if (selectedDocId) {
      fetchDocumentDetails(selectedDocId);
    }
  }, [selectedDocId, fetchDocumentDetails]);

  // Selected document object
  const selectedDoc = useMemo(() => {
    return documents.find(d => d.id === selectedDocId) || null;
  }, [documents, selectedDocId]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Type filter
      if (filterDocType !== 'ALL') {
        if ((doc.document_type || '').toUpperCase() !== filterDocType.toUpperCase()) {
          return false;
        }
      }
      // Status filter
      if (filterIngestionStatus !== 'ALL') {
        if ((doc.ingestion_status || '').toLowerCase() !== filterIngestionStatus.toLowerCase()) {
          return false;
        }
      }
      // Authoritative filter
      if (filterAuthoritative === 'AUTH' && !doc.is_authoritative) return false;
      if (filterAuthoritative === 'STANDARD' && doc.is_authoritative) return false;

      // Search query (title, document_number, source_file_name)
      if (searchDocQuery.trim()) {
        const q = searchDocQuery.toLowerCase();
        const tMatch = (doc.title || '').toLowerCase().includes(q);
        const numMatch = (doc.document_number || '').toLowerCase().includes(q);
        const fMatch = (doc.source_file_name || '').toLowerCase().includes(q);
        if (!tMatch && !numMatch && !fMatch) return false;
      }

      return true;
    });
  }, [documents, filterDocType, filterIngestionStatus, filterAuthoritative, searchDocQuery]);

  // Unique document types in current list for dropdown
  const availableDocTypes = useMemo(() => {
    const set = new Set();
    documents.forEach(d => {
      if (d.document_type) set.add(d.document_type);
    });
    return Array.from(set);
  }, [documents]);

  // Filtered lines in selected document
  const filteredLines = useMemo(() => {
    return extractionLines.filter(line => {
      // Extraction filter
      if (selectedExtractionFilter !== 'ALL') {
        if (line.extraction_id !== selectedExtractionFilter) return false;
      }
      // Review status filter
      if (filterLineReviewStatus !== 'ALL') {
        if ((line.review_status || 'pending').toLowerCase() !== filterLineReviewStatus.toLowerCase()) {
          return false;
        }
      }
      // Domain filter
      if (filterLineDomain !== 'ALL') {
        if (line.domain_code !== filterLineDomain) return false;
      }
      // Text search
      if (searchLineQuery.trim()) {
        const q = searchLineQuery.toLowerCase();
        const rawMatch = (line.raw_description || '').toLowerCase().includes(q);
        const normMatch = (line.normalized_description || '').toLowerCase().includes(q);
        const matMatch = (line.material_code || '').toLowerCase().includes(q);
        const vendMatch = (line.vendor_material_number || '').toLowerCase().includes(q);
        const hsnMatch = (line.hsn_code || '').toLowerCase().includes(q);
        if (!rawMatch && !normMatch && !matMatch && !vendMatch && !hsnMatch) return false;
      }
      return true;
    });
  }, [extractionLines, selectedExtractionFilter, filterLineReviewStatus, filterLineDomain, searchLineQuery]);

  // Document KPIs
  const docMetrics = useMemo(() => {
    const totalExtractions = extractions.length;
    const totalLines = extractionLines.length;
    const pendingReviewCount = extractionLines.filter(
      l => (l.review_status || 'pending').toLowerCase() === 'pending'
    ).length;
    const approvedCount = extractionLines.filter(
      l => ['approved', 'reviewed', 'verified'].includes((l.review_status || '').toLowerCase())
    ).length;
    const highConfidenceCount = extractionLines.filter(l => {
      const conf = Number(l.match_confidence);
      return !isNaN(conf) && (conf > 1 ? conf >= 85 : conf >= 0.85);
    }).length;

    return {
      totalExtractions,
      totalLines,
      pendingReviewCount,
      approvedCount,
      highConfidenceCount
    };
  }, [extractions, extractionLines]);

  // Check if an active/pending extraction job currently exists for the selected document
  const hasActiveExtraction = useMemo(() => {
    return extractions.some(e =>
      ACTIVE_EXTRACTION_STATUSES.includes((e.status || '').toLowerCase())
    );
  }, [extractions]);

  // Overall workspace stats
  const overallMetrics = useMemo(() => {
    const totalDocs = documents.length;
    const authoritativeDocs = documents.filter(d => d.is_authoritative).length;
    return {
      totalDocs,
      authoritativeDocs
    };
  }, [documents]);

  // Status badge styling helper (5 distinct lifecycle states)
  const renderIngestionStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed' || s === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    }
    if (s === 'failed' || s === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
          <AlertCircle size={12} /> Failed
        </span>
      );
    }
    if (s === 'cancelled' || s === 'canceled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          <Ban size={12} /> Cancelled
        </span>
      );
    }
    if (s === 'processing' || s === 'in_progress' || s === 'running') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800 animate-pulse">
          <RefreshCw size={12} className="animate-spin" /> {s === 'running' ? 'Running' : 'Processing'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <Clock size={12} /> Pending
      </span>
    );
  };

  const renderConfidenceBadge = (conf) => {
    if (conf === null || conf === undefined || conf === '') {
      return <span className="text-slate-400 text-xs font-mono">—</span>;
    }
    const num = Number(conf);
    if (isNaN(num)) return <span className="text-xs font-mono">{String(conf)}</span>;
    const pct = num <= 1 ? Math.round(num * 100) : Math.round(num);

    let tone = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (pct >= 85) tone = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    else if (pct >= 60) tone = 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    else tone = 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${tone}`}>
        {pct}%
      </span>
    );
  };

  // Safe formatter for JSONB correction values
  const formatCorrectionValue = (val) => {
    if (val === null || val === undefined) return '<empty>';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  // Handler: Prepare Extraction Job (Step 7 — Idempotent & Database-Backed)
  const handlePrepareExtractionForDoc = async () => {
    if (!selectedDoc?.id) return;
    setIsPreparingJob(true);
    setErrorMsg(null);
    try {
      await prepareInitialDocumentExtractionJob({
        documentId: selectedDoc.id,
        tenantId: selectedDoc.tenant_id || tenantId,
        tenantCompanyId: selectedDoc.tenant_company_id || activeOperatingCompanyId,
        userId: authUserId
      });

      await fetchDocumentDetails(selectedDoc.id);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error preparing extraction:', err);
      setErrorMsg(err.message || 'Failed to prepare extraction job.');
    } finally {
      setIsPreparingJob(false);
    }
  };

  // Handler: Execute extraction worker (Phase 4A contract verification)
  const handleExecuteWorkerForJob = async (jobId) => {
    if (!jobId || !selectedDoc) return;
    setIsExecutingWorker(true);
    setExecutingJobId(jobId);
    setErrorMsg(null);
    try {
      await executeExtractionJob({
        jobId,
        tenantCompanyId: selectedDoc.tenant_company_id || activeOperatingCompanyId,
        userId: authUserId
      });
      await fetchDocumentDetails(selectedDoc.id);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error running extraction worker:', err);
      setErrorMsg(err.message || 'Worker execution failed.');
    } finally {
      setIsExecutingWorker(false);
      setExecutingJobId(null);
    }
  };

  // Handler: Cancel active extraction job (Phase 4A)
  const handleCancelJob = async (jobId) => {
    if (!jobId || !selectedDoc) return;
    setErrorMsg(null);
    try {
      await cancelExtractionJob({
        jobId,
        tenantCompanyId: selectedDoc.tenant_company_id || activeOperatingCompanyId,
        userId: authUserId,
        reason: 'Extraction job cancelled by user'
      });
      await fetchDocumentDetails(selectedDoc.id);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error cancelling job:', err);
      setErrorMsg(err.message || 'Failed to cancel extraction job.');
    }
  };

  // Handler: Retry failed/cancelled extraction job (Phase 4A)
  const handleRetryJob = async (jobId) => {
    if (!jobId || !selectedDoc) return;
    setIsPreparingJob(true); // Re-use preparing state for UI loading
    setErrorMsg(null);
    try {
      await retryExtractionJob({
        jobId,
        tenantCompanyId: selectedDoc.tenant_company_id || activeOperatingCompanyId
      });
      await fetchDocumentDetails(selectedDoc.id);
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Error retrying job:', err);
      setErrorMsg(err.message || 'Failed to retry extraction job.');
    } finally {
      setIsPreparingJob(false);
    }
  };

  // Handler: Download original source document via R2 (Step 9)
  const handleDownloadSourceFile = async (doc) => {
    const attachmentId = doc?.metadata?.file_attachment_id;
    if (!attachmentId) {
      setErrorMsg('No attached storage reference found for this document.');
      return;
    }
    setIsDownloading(true);
    try {
      const res = await createBusinessAttachmentDownloadUrl({
        tenantCompanyId: doc.tenant_company_id || activeOperatingCompanyId,
        attachmentId
      });
      if (res?.download_url) {
        window.open(res.download_url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Download URL could not be generated by storage service.');
      }
    } catch (err) {
      console.error('[MepKnowledgeWorkspace] Download error:', err);
      setErrorMsg(err.message || 'Failed to generate secure download link for document.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Styling helper tokens
  const tCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const tInput = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-sm';
  const tHeader = isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50/70';

  // Render Ingestion Workspace if active
  if (isIngesting) {
    return (
      <MepDocumentIngestionWorkspace
        isDarkMode={isDarkMode}
        onCancel={() => setIsIngesting(false)}
        onComplete={(newDocId) => {
          setIsIngesting(false);
          fetchDocuments();
          if (newDocId) {
            setSelectedDocId(newDocId);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className={`p-5 rounded-2xl border ${tCard} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Brain size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                MEP Knowledge Workspace
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800">
                <Info size={12} /> Inspection Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Read-only corpus inspector for MEP document examples, automated extractions, normalized lines, and AI correction feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsIngesting(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Upload size={14} />
            <span>Ingest Document</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedDocId) {
                fetchDocumentDetails(selectedDocId);
              }
              fetchDocuments();
            }}
            disabled={isLoadingDocs || isLoadingDetails}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoadingDocs || isLoadingDetails ? 'animate-spin' : ''} />
            <span>Refresh Corpus</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW SELECTION: 1. DOCUMENTS LIST vs 2. DOCUMENT DETAIL */}
      {!selectedDocId ? (
        /* ========================================================================= */
        /* VIEW 1: KNOWLEDGE DOCUMENTS LIST                                         */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-xl border ${tCard}`}>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Documents</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {overallMetrics.totalDocs}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">MEP document corpus</div>
            </div>
            <div className={`p-4 rounded-xl border ${tCard}`}>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Authoritative Docs</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck size={20} />
                <span>{overallMetrics.authoritativeDocs}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ground-truth gold examples</div>
            </div>
            <div className={`p-4 rounded-xl border ${tCard}`}>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Ingestions</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {documents.filter(d => (d.ingestion_status || '').toLowerCase() === 'completed').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fully processed & parsed</div>
            </div>
            <div className={`p-4 rounded-xl border ${tCard}`}>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Ingestions</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {documents.filter(d => ['pending', 'processing', 'in_progress'].includes((d.ingestion_status || '').toLowerCase())).length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting extraction pipeline</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className={`p-4 rounded-xl border ${tCard} flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, document number, or source file name..."
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Document Type Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter size={13} />
                <select
                  value={filterDocType}
                  onChange={(e) => setFilterDocType(e.target.value)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
                >
                  <option value="ALL">All Document Types</option>
                  {availableDocTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  {!availableDocTypes.includes('BOQ') && <option value="BOQ">BOQ</option>}
                  {!availableDocTypes.includes('PO') && <option value="PO">PO</option>}
                  {!availableDocTypes.includes('INVOICE') && <option value="INVOICE">INVOICE</option>}
                  {!availableDocTypes.includes('SPEC') && <option value="SPEC">SPEC</option>}
                </select>
              </div>

              {/* Ingestion Status Filter */}
              <select
                value={filterIngestionStatus}
                onChange={(e) => setFilterIngestionStatus(e.target.value)}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              >
                <option value="ALL">All Ingestion Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              {/* Authoritative Filter */}
              <select
                value={filterAuthoritative}
                onChange={(e) => setFilterAuthoritative(e.target.value)}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              >
                <option value="ALL">All Authorities</option>
                <option value="AUTH">Authoritative Only</option>
                <option value="STANDARD">Standard Examples</option>
              </select>
            </div>
          </div>

          {/* Documents Table */}
          <div className={`rounded-xl border ${tCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b border-slate-200 dark:border-slate-800 ${tHeader} text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]`}>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Doc #</th>
                    <th className="py-3 px-4">Source File</th>
                    <th className="py-3 px-4">Doc Date</th>
                    <th className="py-3 px-4">Ingestion Status</th>
                    <th className="py-3 px-4">Authoritative</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoadingDocs ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={20} className="animate-spin text-sky-500" />
                          <span>Loading MEP document corpus...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText size={28} className="text-slate-300 dark:text-slate-600" />
                          <p className="font-semibold text-slate-600 dark:text-slate-400">
                            No MEP document examples found
                          </p>
                          <p className="text-xs text-slate-400">
                            {searchDocQuery || filterDocType !== 'ALL' || filterIngestionStatus !== 'ALL'
                              ? 'Try adjusting your search criteria or filters.'
                              : 'No document examples have been uploaded to mep_document_examples for this company.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsIngesting(true)}
                            className="mt-3 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
                          >
                            <Upload size={14} />
                            <span>Ingest Real MEP Document</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      >
                        {/* Title */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                            {doc.title || 'Untitled Document'}
                          </div>
                          {doc.metadata?.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {doc.metadata.description}
                            </div>
                          )}
                        </td>

                        {/* Document Type */}
                        <td className="py-3 px-4">
                          <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {doc.document_type || 'GENERAL'}
                          </span>
                        </td>

                        {/* Document Number */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {doc.document_number || '—'}
                        </td>

                        {/* Source File Name */}
                        <td className="py-3 px-4 font-mono text-slate-500 max-w-[200px] truncate" title={doc.source_file_name}>
                          {doc.source_file_name || '—'}
                        </td>

                        {/* Document Date */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {doc.document_date ? new Date(doc.document_date).toLocaleDateString() : '—'}
                        </td>

                        {/* Ingestion Status */}
                        <td className="py-3 px-4">
                          {renderIngestionStatusBadge(doc.ingestion_status)}
                        </td>

                        {/* Authoritative Indicator */}
                        <td className="py-3 px-4">
                          {doc.is_authoritative ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" /> Authoritative
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Standard</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                            Inspect <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: DOCUMENT DETAIL WORKSPACE                                         */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Back & Breadcrumb navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedDocId(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Knowledge Documents
            </button>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span>Doc ID:</span>
              <span className="text-slate-600 dark:text-slate-300">{selectedDoc?.id}</span>
            </div>
          </div>

          {/* VIEW 2: DOCUMENT DETAIL HEADER CARD */}
          {selectedDoc && (
            <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedDoc.title || 'Untitled Document'}
                    </h2>
                    {renderIngestionStatusBadge(selectedDoc.ingestion_status)}
                    {selectedDoc.is_authoritative && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <ShieldCheck size={13} /> Authoritative Reference Example
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2">
                    <div>
                      <span className="text-slate-400 font-medium">Document Type: </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedDoc.document_type || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Document Number: </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedDoc.document_number || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Document Date: </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {selectedDoc.document_date ? new Date(selectedDoc.document_date).toLocaleDateString() : '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Source File: </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono truncate inline-block max-w-[180px] align-bottom" title={selectedDoc.source_file_name}>
                        {selectedDoc.source_file_name || '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Document Detail Actions (Download / Prepare Extraction) */}
                <div className="flex items-center gap-2 self-start flex-wrap">
                  {selectedDoc.metadata?.file_attachment_id && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSourceFile(selectedDoc)}
                      disabled={isDownloading}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
                      title="Download/preview original source document from Cloudflare R2"
                    >
                      <Download size={14} className={isDownloading ? 'animate-bounce' : 'text-sky-500'} />
                      <span>{isDownloading ? 'Opening...' : 'View / Download Source'}</span>
                      {selectedDoc.metadata?.file_size && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({formatBytes(selectedDoc.metadata.file_size)})
                        </span>
                      )}
                    </button>
                  )}

                  {!hasActiveExtraction && (
                    <button
                      type="button"
                      onClick={handlePrepareExtractionForDoc}
                      disabled={isPreparingJob}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
                      title="Create pending extraction job in mep_document_extractions"
                    >
                      <Sparkles size={14} className={isPreparingJob ? 'animate-spin' : ''} />
                      <span>{isPreparingJob ? 'Preparing Job...' : 'Prepare Extraction'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Extraction Pending Callout Banner */}
              {((selectedDoc.ingestion_status || '').toLowerCase() === 'pending' || hasActiveExtraction) && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-800 dark:text-amber-300">Extraction Pending</span>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                        This document is registered in <code className="font-mono">mep_document_examples</code>. Extraction job is pending pipeline processing. No automated AI parsing or extraction lines generated yet.
                      </p>
                    </div>
                  </div>
                  {!hasActiveExtraction && (
                    <button
                      type="button"
                      onClick={handlePrepareExtractionForDoc}
                      disabled={isPreparingJob}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 flex-shrink-0 shadow-sm"
                    >
                      <Sparkles size={13} />
                      <span>{isPreparingJob ? 'Preparing...' : 'Prepare Extraction'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* View 2 KPIs: Extractions, Extracted Lines, Pending Review Count */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Extractions</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {docMetrics.totalExtractions}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Extracted Lines</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {docMetrics.totalLines}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Pending Review</div>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                    {docMetrics.pendingReviewCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">High Confidence Matches</div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {docMetrics.highConfidenceCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW TABS: LINES vs EXTRACTIONS vs AI CORRECTIONS */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveDocTab('lines')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'lines'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Layers size={14} /> Extraction Lines ({extractionLines.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('extractions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'extractions'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Cpu size={14} /> Extractions Runs ({extractions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('corrections')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDocTab === 'corrections'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <History size={14} /> All AI Corrections ({aiCorrections.length})
            </button>
          </div>

          {/* TAB CONTENT */}

          {/* ========================================================================= */}
          {/* VIEW 3: EXTRACTIONS RUNS                                                  */}
          {/* ========================================================================= */}
          {activeDocTab === 'extractions' && (
            <div className={`rounded-xl border ${tCard} overflow-hidden`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Document Extractions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI/OCR pipeline extraction executions and model performance metrics.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b border-slate-200 dark:border-slate-800 ${tHeader} text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]`}>
                      <th className="py-3 px-3">Extraction Type</th>
                      <th className="py-3 px-3">Provider</th>
                      <th className="py-3 px-3">Model</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-2">Confidence</th>
                      <th className="py-3 px-3">Started</th>
                      <th className="py-3 px-3">Completed</th>
                      <th className="py-3 px-3">Envelope</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {extractions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                          No extraction runs recorded for this document.
                        </td>
                      </tr>
                    ) : (
                      extractions.map((ext) => {
                        const s = (ext.status || 'pending').toLowerCase();
                        const isPending = s === 'pending';
                        const isProcessing = s === 'processing' || s === 'in_progress' || s === 'running';
                        const isTerminal = s === 'completed' || s === 'failed' || s === 'cancelled';
                        const isJobRunningNow = isExecutingWorker && executingJobId === ext.id;

                        return (
                          <tr key={ext.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            {/* Extraction Type */}
                            <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                              {ext.extraction_type || 'DOCUMENT_EXTRACTION'}
                            </td>

                            {/* Provider */}
                            <td className="py-3 px-3 font-semibold">
                              {ext.provider === 'DRY_RUN' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                  <CheckCircle2 size={12} /> Dry Run
                                </span>
                              ) : (
                                <span className="text-slate-700 dark:text-slate-300">{ext.provider || '—'}</span>
                              )}
                            </td>

                            {/* Model */}
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {ext.model_name || '—'}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              {renderIngestionStatusBadge(ext.status)}
                            </td>

                            {/* Confidence */}
                            <td className="py-3 px-2">
                              {renderConfidenceBadge(ext.confidence_score)}
                            </td>

                            {/* Started */}
                            <td className="py-3 px-3 text-slate-500 text-[11px]">
                              {ext.started_at ? new Date(ext.started_at).toLocaleString() : '—'}
                            </td>

                            {/* Completed */}
                            <td className="py-3 px-3 text-slate-500 text-[11px]">
                              {ext.completed_at ? new Date(ext.completed_at).toLocaleString() : '—'}
                            </td>

                            {/* Envelope Inspection */}
                            <td className="py-3 px-3">
                              {ext.raw_output ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRawEnvelope(ext.raw_output);
                                    setSelectedExtractionJobForModal(ext);
                                    setIsRawModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 flex items-center gap-1.5 transition cursor-pointer"
                                  title="Inspect Raw Extraction Output Envelope"
                                >
                                  <FileCode2 size={13} />
                                  <span>Inspect</span>
                                </button>
                              ) : ext.error_message ? (
                                <div className="text-[10px] text-rose-600 font-mono max-w-[130px] truncate" title={ext.error_message}>
                                  {ext.error_message}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs italic">—</span>
                              )}
                            </td>

                            {/* Actions (Phase 4A Worker Execution / Cancel / Retry) */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleExecuteWorkerForJob(ext.id)}
                                      disabled={isExecutingWorker}
                                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 transition cursor-pointer shadow-sm disabled:opacity-50"
                                      title="Run extraction worker contract verification"
                                    >
                                      {isJobRunningNow ? (
                                        <RefreshCw size={11} className="animate-spin" />
                                      ) : (
                                        <Play size={11} />
                                      )}
                                      <span>{isJobRunningNow ? 'Running...' : 'Run Worker'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelJob(ext.id)}
                                      disabled={isExecutingWorker}
                                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                                      title="Cancel Extraction Job"
                                    >
                                      <Ban size={14} />
                                    </button>
                                  </>
                                )}

                                {isProcessing && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelJob(ext.id)}
                                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 flex items-center gap-1 transition cursor-pointer"
                                    title="Cancel In-Progress Extraction"
                                  >
                                    <Ban size={12} />
                                    <span>Cancel</span>
                                  </button>
                                )}

                                {isTerminal && (s === 'failed' || s === 'cancelled') && !hasActiveExtraction && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryJob(ext.id)}
                                    disabled={isPreparingJob}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                    title="Retry Extraction via Backend Worker"
                                  >
                                    <RefreshCw size={11} className={isPreparingJob ? 'animate-spin' : ''} />
                                    <span>{isPreparingJob ? 'Retrying...' : 'Retry'}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: EXTRACTION LINES                                                  */}
          {/* ========================================================================= */}
          {activeDocTab === 'lines' && (
            <div className="space-y-4">
              {/* Lines Filter Toolbar */}
              <div className={`p-4 rounded-xl border ${tCard} flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search raw desc, normalized desc, material code, or HSN..."
                    value={searchLineQuery}
                    onChange={(e) => setSearchLineQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Extraction Run Filter */}
                  {extractions.length > 1 && (
                    <select
                      value={selectedExtractionFilter}
                      onChange={(e) => setSelectedExtractionFilter(e.target.value)}
                      className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none`}
                    >
                      <option value="ALL">All Extractions</option>
                      {extractions.map((ext, idx) => (
                        <option key={ext.id} value={ext.id}>
                          Run #{idx + 1} ({ext.provider || ext.model_name || 'Extraction'})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Review Status Filter */}
                  <select
                    value={filterLineReviewStatus}
                    onChange={(e) => setFilterLineReviewStatus(e.target.value)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none`}
                  >
                    <option value="ALL">All Review Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {/* Domain Filter */}
                  <select
                    value={filterLineDomain}
                    onChange={(e) => setFilterLineDomain(e.target.value)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium ${tInput} focus:outline-none`}
                  >
                    <option value="ALL">All Domains</option>
                    {mepDomains.map((d) => (
                      <option key={d.code || d.domain_code} value={d.code || d.domain_code}>
                        {d.name || d.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lines Table */}
              <div className={`rounded-xl border ${tCard} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b border-slate-200 dark:border-slate-800 ${tHeader} text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]`}>
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-2">Page</th>
                        <th className="py-3 px-4 min-w-[200px]">Raw Description</th>
                        <th className="py-3 px-3">Mat Code</th>
                        <th className="py-3 px-3">Vendor #</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Domain</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Qty</th>
                        <th className="py-3 px-2">UOM</th>
                        <th className="py-3 px-3">Unit Rate</th>
                        <th className="py-3 px-3">HSN</th>
                        <th className="py-3 px-4 min-w-[180px]">Normalized Description</th>
                        <th className="py-3 px-4 min-w-[160px]">Candidate Item</th>
                        <th className="py-3 px-3">Confidence</th>
                        <th className="py-3 px-3">Match Method</th>
                        <th className="py-3 px-3">Review Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {isLoadingDetails ? (
                        <tr>
                          <td colSpan={18} className="py-12 text-center text-slate-400 font-sans">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw size={18} className="animate-spin text-sky-500" />
                              <span>Loading extracted lines...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredLines.length === 0 ? (
                        <tr>
                          <td colSpan={18} className="py-10 text-center text-slate-400 font-sans italic">
                            No extraction lines match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredLines.map((line) => {
                          const domain = mepDomains.find(d => d.code === line.domain_code || d.domain_code === line.domain_code);
                          const category = mepCategories.find(c => c.id === line.category_id);
                          const candidateItem = items.find(i => i.id === line.candidate_inventory_item_id);

                          return (
                            <tr
                              key={line.id}
                              onClick={() => {
                                setSelectedLineForModal(line);
                                setIsLineModalOpen(true);
                              }}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                            >
                              {/* Line Number */}
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                                {line.line_no ?? '—'}
                              </td>

                              {/* Source Page */}
                              <td className="py-3 px-2 text-slate-500">
                                {line.source_page ?? '—'}
                              </td>

                              {/* Raw Description */}
                              <td className="py-3 px-4 font-sans text-xs text-slate-800 dark:text-slate-200 line-clamp-2" title={line.raw_description}>
                                {line.raw_description || <span className="text-slate-400 italic">No description</span>}
                              </td>

                              {/* Material Code */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                                {line.material_code || '—'}
                              </td>

                              {/* Vendor Material Number */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                                {line.vendor_material_number || '—'}
                              </td>

                              {/* Item Type */}
                              <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-400">
                                {line.item_type || '—'}
                              </td>

                              {/* Domain */}
                              <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                                {domain?.name || line.domain_code || '—'}
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                                {category?.name || (line.category_id ? line.category_id.slice(0, 8) : '—')}
                              </td>

                              {/* Quantity */}
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                                {line.quantity !== null && line.quantity !== undefined ? line.quantity : '—'}
                              </td>

                              {/* UOM */}
                              <td className="py-3 px-2 font-bold text-slate-600 dark:text-slate-400">
                                {line.uom_code || '—'}
                              </td>

                              {/* Unit Rate */}
                              <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                                {line.unit_rate !== null && line.unit_rate !== undefined ? `₹${Number(line.unit_rate).toLocaleString()}` : '—'}
                              </td>

                              {/* HSN */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                {line.hsn_code || '—'}
                              </td>

                              {/* Normalized Description */}
                              <td className="py-3 px-4 font-sans text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2" title={line.normalized_description}>
                                {line.normalized_description || <span className="text-slate-400 italic">Unnormalized</span>}
                              </td>

                              {/* Candidate Item */}
                              <td className="py-3 px-4 font-sans">
                                {candidateItem ? (
                                  <div>
                                    <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                      {candidateItem.item_code}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                      {candidateItem.item_name}
                                    </div>
                                  </div>
                                ) : line.candidate_inventory_item_id ? (
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {line.candidate_inventory_item_id.slice(0, 8)}...
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">—</span>
                                )}
                              </td>

                              {/* Match Confidence */}
                              <td className="py-3 px-3">
                                {renderConfidenceBadge(line.match_confidence)}
                              </td>

                              {/* Match Method */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                {line.match_method || '—'}
                              </td>

                              {/* Review Status */}
                              <td className="py-3 px-3 font-sans">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  line.review_status === 'approved' || line.review_status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : line.review_status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {line.review_status || 'pending'}
                                </span>
                              </td>

                              {/* Action */}
                              <td className="py-3 px-3 text-right font-sans">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLineForModal(line);
                                    setIsLineModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                  title="View Line Details"
                                >
                                  <Eye size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 6: ALL AI CORRECTIONS FOR THIS DOCUMENT                             */}
          {/* ========================================================================= */}
          {activeDocTab === 'corrections' && (
            <div className={`rounded-xl border ${tCard} overflow-hidden p-5 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <History size={16} className="text-purple-500" /> Document AI Corrections Log
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Historical record of manual supervisor and engineer corrections across all extraction lines.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  {aiCorrections.length} correction{aiCorrections.length !== 1 ? 's' : ''}
                </span>
              </div>

              {aiCorrections.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No AI corrections recorded for lines in this document.
                </div>
              ) : (
                <div className="space-y-3">
                  {aiCorrections.map((corr) => {
                    const matchedLine = extractionLines.find(l => l.id === corr.extraction_line_id);
                    const reviewerName = getUserDisplayName(corr.reviewer_id, profiles, tenantMembers);

                    return (
                      <div
                        key={corr.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[11px]">
                              Line #{matchedLine?.line_no || '—'}
                            </span>
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px]">
                              {corr.field_name}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                              Reviewer: <strong>{reviewerName}</strong>
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(corr.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Value Diff */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">Previous Value</div>
                            <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 line-through break-all">
                              {formatCorrectionValue(corr.previous_value)}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Corrected Value</div>
                            <div className="font-mono font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5 break-all">
                              {formatCorrectionValue(corr.corrected_value)}
                            </div>
                          </div>
                        </div>

                        {/* Correction Reason */}
                        {corr.correction_reason && (
                          <div className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-950/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                            &ldquo;{corr.correction_reason}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: LINE DETAIL MODAL (with VIEW 6 AI Corrections inside) */}
      <LineDetailModal
        isOpen={isLineModalOpen}
        onClose={() => {
          setIsLineModalOpen(false);
          setSelectedLineForModal(null);
        }}
        line={selectedLineForModal}
        corrections={aiCorrections}
        items={items}
        domains={mepDomains}
        categories={mepCategories}
        profiles={profiles}
        tenantMembers={tenantMembers}
        isDarkMode={isDarkMode}
      />

      {/* RAW EXTRACTION ENVELOPE MODAL (Phase 4A) */}
      <RawExtractionModal
        isOpen={isRawModalOpen}
        onClose={() => {
          setIsRawModalOpen(false);
          setSelectedRawEnvelope(null);
          setSelectedExtractionJobForModal(null);
        }}
        rawOutput={selectedRawEnvelope}
        extractionJob={selectedExtractionJobForModal}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
