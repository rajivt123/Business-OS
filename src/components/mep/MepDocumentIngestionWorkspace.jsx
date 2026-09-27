import React, { useState } from 'react';
import {
  Upload,
  FileText,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Hash,
  Tag,
  Info,
  X,
  Sparkles,
  File,
  Building2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCrm } from '../../context/CrmContext';
import {
  uploadBusinessAttachment,
  formatBytes,
  validateDocumentFile
} from '../../lib/storageService';

const DOCUMENT_TYPES = [
  { value: 'BOQ', label: 'Bill of Quantities (BOQ)' },
  { value: 'PO', label: 'Purchase Order (PO)' },
  { value: 'VENDOR_QUOTATION', label: 'Vendor Quotation' },
  { value: 'PURCHASE_BILL', label: 'Purchase Bill / Tax Invoice' },
  { value: 'SPECIFICATION', label: 'Specification / Technical Datasheet' },
  { value: 'DRAWING', label: 'MEP Engineering Drawing / Schedule' },
  { value: 'WORK_ORDER', label: 'Work Order (WO)' },
  { value: 'SALES_QUOTATION', label: 'Sales Quotation' },
  { value: 'OTHER', label: 'Other MEP Document' }
];

export default function MepDocumentIngestionWorkspace({
  onComplete,
  onCancel,
  isDarkMode = false
}) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    operatingCompanies = [],
    currentUser,
    session
  } = crmContext;

  const authUserId = session?.user?.id || currentUser?.id;
  const activeCompany = operatingCompanies.find(c => c.id === activeOperatingCompanyId) || null;

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('BOQ');
  const [customDocType, setCustomDocType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [isAuthoritative, setIsAuthoritative] = useState(false);
  const [notes, setNotes] = useState('');

  // Status & Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(''); // 'validating' | 'uploading_r2' | 'registering' | 'complete'
  const [errorMsg, setErrorMsg] = useState(null);
  const [registeredDoc, setRegisteredDoc] = useState(null);
  const [isPreparingExtraction, setIsPreparingExtraction] = useState(false);
  const [preparedExtraction, setPreparedExtraction] = useState(null);

  // File Selection Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      setSelectedFile(null);
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    // Auto-populate document title from filename if empty
    if (!documentTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  // Drag and Drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      setSelectedFile(null);
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    if (!documentTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  // Submit & Ingestion Handler
  const handleIngestDocument = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Step 5 Validation
    if (!authUserId) {
      setErrorMsg('You must be signed in with an active account to ingest documents.');
      return;
    }
    if (!activeOperatingCompanyId) {
      setErrorMsg('Please select an active operating company before ingesting documents.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please select a real document file to upload.');
      return;
    }
    if (!documentTitle.trim()) {
      setErrorMsg('Please provide a document title.');
      return;
    }

    const finalType = documentType === 'OTHER' && customDocType.trim() ? customDocType.trim().toUpperCase() : documentType;
    const newDocumentId = crypto.randomUUID();

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStep('uploading_r2');

    try {
      // Step 4: Storage Flow — Upload directly to Cloudflare R2 via storageService
      const uploadResult = await uploadBusinessAttachment({
        tenantCompanyId: activeOperatingCompanyId,
        entityType: 'document',
        entityId: newDocumentId,
        fieldKey: 'file',
        file: selectedFile,
        version: '1.0',
        metadata: {
          mep_document_id: newDocumentId,
          document_type: finalType,
          document_number: documentNumber.trim() || null,
          title: documentTitle.trim()
        },
        onProgress: (pct) => {
          // Map 0-100 progress to 10-85%
          setUploadProgress(10 + Math.round(pct * 0.75));
        }
      });

      setUploadStep('registering');
      setUploadProgress(90);

      // Step 3: Register in mep_document_examples
      const docPayload = {
        id: newDocumentId,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId,
        title: documentTitle.trim(),
        document_type: finalType,
        document_number: documentNumber.trim() || null,
        document_date: documentDate ? new Date(documentDate).toISOString() : null,
        source_file_name: selectedFile.name,
        ingestion_status: 'pending',
        is_authoritative: Boolean(isAuthoritative),
        metadata: {
          file_attachment_id: uploadResult.attachment_id || uploadResult.id,
          r2_key: uploadResult.storage_key,
          mime_type: selectedFile.type || 'application/octet-stream',
          file_size: selectedFile.size,
          notes: notes.trim() || null
        },
        created_by: authUserId
      };

      const { data: newDocData, error: insertError } = await supabase
        .from('mep_document_examples')
        .insert(docPayload)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Document database registration failed: ${insertError.message}`);
      }

      setUploadProgress(100);
      setUploadStep('complete');
      setRegisteredDoc(newDocData || docPayload);
    } catch (err) {
      console.error('[MepDocumentIngestion] Error during ingestion:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during document ingestion.');
    } finally {
      setIsUploading(false);
    }
  };

  // Step 7: Prepare Extraction Job
  const handlePrepareExtraction = async () => {
    if (!registeredDoc?.id) return;
    setIsPreparingExtraction(true);
    setErrorMsg(null);

    try {
      const extPayload = {
        tenant_id: registeredDoc.tenant_id || tenantId,
        tenant_company_id: registeredDoc.tenant_company_id || activeOperatingCompanyId,
        document_example_id: registeredDoc.id,
        extraction_type: 'DOCUMENT_EXTRACTION',
        provider: 'pending',
        model_name: null,
        model_version: null,
        status: 'pending',
        created_by: authUserId
      };

      const { data: extData, error: extError } = await supabase
        .from('mep_document_extractions')
        .insert(extPayload)
        .select()
        .single();

      if (extError) {
        throw new Error(`Failed to initialize extraction job: ${extError.message}`);
      }

      setPreparedExtraction(extData || extPayload);
    } catch (err) {
      console.error('[MepDocumentIngestion] Prepare extraction error:', err);
      setErrorMsg(err.message || 'Failed to initialize extraction job.');
    } finally {
      setIsPreparingExtraction(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentTitle('');
    setDocumentType('BOQ');
    setCustomDocType('');
    setDocumentNumber('');
    setDocumentDate('');
    setIsAuthoritative(false);
    setNotes('');
    setRegisteredDoc(null);
    setPreparedExtraction(null);
    setUploadStep('');
    setErrorMsg(null);
  };

  // Styling helpers
  const tCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const tInput = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-sm';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className={`p-5 rounded-2xl border ${tCard} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Back to Knowledge Workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Upload size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                MEP Document Ingestion
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <ShieldCheck size={12} /> Cloudflare R2 Storage
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely register original MEP source documents. Files remain intact and unmodified as ground truth.
            </p>
          </div>
        </div>

        {/* Operating Company Context */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Building2 size={14} className="text-sky-500" />
          <span>Company: <strong>{activeCompany?.name || 'Active Operating Company'}</strong></span>
        </div>
      </div>

      {/* Error Callout */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUCCESS CARD (After Registration) */}
      {registeredDoc ? (
        <div className={`p-6 rounded-2xl border ${tCard} space-y-5 animate-in zoom-in-95 duration-150`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                MEP Document Successfully Registered
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The document has been securely stored in Cloudflare R2 and registered in <code className="text-sky-600 dark:text-sky-400 font-mono">mep_document_examples</code> with status <span className="font-semibold text-amber-600 dark:text-amber-400">pending</span>.
              </p>
            </div>
          </div>

          {/* Registration Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Title</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{registeredDoc.title}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Document Type</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{registeredDoc.document_type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source File</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate block" title={registeredDoc.source_file_name}>
                {registeredDoc.source_file_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ingestion Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                Pending Extraction
              </span>
            </div>
          </div>

          {/* Step 7: Extraction Job Section */}
          <div className="p-4 rounded-xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-sky-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Extraction Pipeline Job
                </h4>
              </div>
              {preparedExtraction ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  <CheckCircle2 size={12} /> Extraction Job Initialized (Pending)
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to initialize extraction job
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {preparedExtraction
                ? 'Extraction job record created in mep_document_extractions. Status is pending for future OCR/AI pipeline processing.'
                : 'Click "Prepare Extraction" to register a pending job in mep_document_extractions. Note: No AI provider is invoked at this stage.'}
            </p>

            {!preparedExtraction && (
              <button
                type="button"
                onClick={handlePrepareExtraction}
                disabled={isPreparingExtraction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isPreparingExtraction ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Preparing Job...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Prepare Extraction Job</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              Upload Another Document
            </button>

            <button
              type="button"
              onClick={() => onComplete?.(registeredDoc.id)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 flex items-center gap-2 transition cursor-pointer shadow"
            >
              <span>View in Knowledge Workspace</span>
              <FileCheck2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* INGESTION FORM */
        <form onSubmit={handleIngestDocument} className={`p-6 rounded-2xl border ${tCard} space-y-6`}>
          {/* File Dropzone */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Select Source MEP Document *
            </label>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 bg-slate-50/50 dark:bg-slate-950/30'
                }`}
              >
                <input
                  type="file"
                  id="mep-file-input"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg,.jpeg,.tiff"
                />
                <label htmlFor="mep-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline">
                      Click to choose a file
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs"> or drag and drop here</span>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Supported: PDF, Excel (.xlsx/.xls), CSV, Word (.docx), Images. Maximum file size: 150 MB.
                  </p>
                </label>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <File size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{selectedFile.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-mono">
                        {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatBytes(selectedFile.size)}</span>
                      <span>•</span>
                      <span>{selectedFile.type || 'application/octet-stream'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <FileText size={13} className="text-sky-500" /> Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HVAC Chiller Schedule & BOQ Phase 2"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                disabled={isUploading}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Tag size={13} className="text-violet-500" /> Document Type *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                disabled={isUploading}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Custom Doc Type input if OTHER selected */}
            {documentType === 'OTHER' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Custom Document Type Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. TESTING_AND_COMMISSIONING_REPORT"
                  value={customDocType}
                  onChange={(e) => setCustomDocType(e.target.value)}
                  disabled={isUploading}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
              </div>
            )}

            {/* Document Number */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Hash size={13} className="text-blue-500" /> Document / Reference Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. BOQ-2026-0042 or PO-99120"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                disabled={isUploading}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            </div>

            {/* Document Date */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Calendar size={13} className="text-amber-500" /> Document Date (Optional)
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                disabled={isUploading}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500`}
              />
            </div>
          </div>

          {/* Authoritative Checkbox (Step 10) */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAuthoritative}
                onChange={(e) => setIsAuthoritative(e.target.checked)}
                disabled={isUploading}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Authoritative / Ground Truth Example
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Designate this document as verified ground truth for building the MEP knowledge corpus and baseline normalization.
                </p>
              </div>
            </label>
          </div>

          {/* Notes / Context */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Ingestion Notes / Context (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Received from Johnson Controls for Hyderabad Data Center project..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isUploading}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${tInput} focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none`}
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin text-sky-500" />
                  {uploadStep === 'uploading_r2' && 'Directly uploading to Cloudflare R2...'}
                  {uploadStep === 'registering' && 'Registering document example in database...'}
                  {uploadStep === 'complete' && 'Registration complete!'}
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !selectedFile || !documentTitle.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Ingesting Document...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload & Ingest Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
