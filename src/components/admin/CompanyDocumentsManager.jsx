import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import {
  FileCheck2, Upload, FileText, Download, Eye, Archive,
  RefreshCw, Search, AlertCircle, CheckCircle2,
  X, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import {
  formatBytes,
  validateDocumentFile,
  createUploadUrl,
  uploadFileToR2,
  finalizeUpload,
  createDownloadUrl,
  archiveDocument,
  getCompanyDocuments
} from '../../lib/storageService';

const DOCUMENT_TYPES = [
  'PAN',
  'GST Certificate',
  'Incorporation Certificate',
  'CIN / LLP documents',
  'TAN',
  'Udyam',
  'IEC',
  'PF',
  'ESIC',
  'Professional Tax',
  'Address Proof',
  'Bank Proof',
  'Other'
];

export default function CompanyDocumentsManager({
  companyId,
  companyName = 'Company',
  isOwner = true,
  onDocumentsUpdated,
  onError,
  onSuccess
}) {
  const fileInputRef = useRef(null);
  const [, startTransition] = useTransition();

  // Document list state
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all' | 'active' | 'archived'
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Upload Modal & State Machine
  // Stages: 'IDLE' | 'SELECTED' | 'PREPARING' | 'REQUESTING_URL' | 'UPLOADING' | 'FINALIZING' | 'COMPLETED' | 'ERROR'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStage, setUploadStage] = useState('IDLE');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [canRetryFinalize, setCanRetryFinalize] = useState(false);
  const [cachedUploadContext, setCachedUploadContext] = useState(null);

  // Upload Form Fields
  const [formDocType, setFormDocType] = useState('GST Certificate');
  const [customDocType, setCustomDocType] = useState('');
  const [formDocName, setFormDocName] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Preview Modal State
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    doc: null,
    url: '',
    isLoading: false,
    error: ''
  });

  // Archive Modal Confirmation State
  const [archiveModalDoc, setArchiveModalDoc] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Load documents on mount or companyId change
  const loadDocuments = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    setListError('');
    try {
      const data = await getCompanyDocuments(companyId, { includeArchived: true });
      startTransition(() => {
        setDocuments(data || []);
      });
      if (onDocumentsUpdated) {
        onDocumentsUpdated(data || []);
      }
    } catch (err) {
      console.error('[CompanyDocumentsManager] loadDocuments error:', err);
      const msg = err.message || 'Failed to fetch company documents.';
      setListError(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, onDocumentsUpdated, onError]);

  useEffect(() => {
    if (companyId) {
      loadDocuments();
    }
  }, [companyId, loadDocuments]);

  // File selection & Drag-and-Drop Handlers
  function handleFileSelected(file) {
    if (!file) return;

    // Frontend file validation (including strict 150MB check)
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      setUploadStage('ERROR');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadStage('SELECTED');
    setUploadProgress(0);
    setLoadedBytes(0);
    setTotalBytes(file.size);
    setCanRetryFinalize(false);
    setCachedUploadContext(null);

    // Auto-populate document name if empty
    if (!formDocName || formDocName.trim() === '') {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setFormDocName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  // Reset Upload Form State
  function resetUploadForm() {
    setSelectedFile(null);
    setUploadStage('IDLE');
    setUploadProgress(0);
    setLoadedBytes(0);
    setTotalBytes(0);
    setUploadError('');
    setCanRetryFinalize(false);
    setCachedUploadContext(null);
    setFormDocType('GST Certificate');
    setCustomDocType('');
    setFormDocName('');
    setFormDocNumber('');
    setFormIssueDate('');
    setFormExpiryDate('');
    setFormNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function openUploadModal() {
    resetUploadForm();
    setIsUploadModalOpen(true);
  }

  function closeUploadModal() {
    if (uploadStage === 'UPLOADING' || uploadStage === 'FINALIZING') {
      if (!window.confirm('An upload is currently in progress. Are you sure you want to cancel?')) {
        return;
      }
    }
    setIsUploadModalOpen(false);
    resetUploadForm();
  }

  // Pipeline Execution: Full R2 Upload
  async function handleStartUpload() {
    if (!selectedFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    if (!companyId) {
      setUploadError('Company must be saved before uploading documents.');
      return;
    }

    // Verify Owner authorization
    if (!isOwner) {
      setUploadError('Unauthorized: Only organization Owners can upload company documents.');
      return;
    }

    setUploadError('');
    setCanRetryFinalize(false);

    const docTypeFinal = formDocType === 'Other' && customDocType.trim() ? customDocType.trim() : formDocType;
    const docNameFinal = formDocName.trim() || selectedFile.name;

    try {
      // Stage 1: Preparing
      setUploadStage('PREPARING');

      // Stage 2: Requesting secure upload URL from Edge Function
      setUploadStage('REQUESTING_URL');
      const uploadUrlResponse = await createUploadUrl({
        tenantCompanyId: companyId,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || 'application/octet-stream',
        fileSizeBytes: selectedFile.size
      });

      const {
        document_id,
        storage_key,
        upload_url,
        file_name,
        mime_type,
        file_size_bytes
      } = uploadUrlResponse;

      // Cache upload context so user can retry finalize if finalize fails after PUT
      const context = {
        documentId: document_id,
        storageKey: storage_key,
        fileName: file_name || selectedFile.name,
        mimeType: mime_type || selectedFile.type || 'application/octet-stream',
        fileSizeBytes: file_size_bytes || selectedFile.size,
        documentType: docTypeFinal,
        documentName: docNameFinal,
        documentNumber: formDocNumber.trim(),
        issueDate: formIssueDate || null,
        expiryDate: formExpiryDate || null,
        notes: formNotes.trim()
      };
      setCachedUploadContext(context);

      // Stage 3: Direct HTTP PUT to Cloudflare R2 presigned URL
      setUploadStage('UPLOADING');
      await uploadFileToR2(
        upload_url,
        selectedFile,
        selectedFile.type,
        (percent, loaded, total) => {
          setUploadProgress(percent);
          setLoadedBytes(loaded);
          setTotalBytes(total);
        }
      );

      // Stage 4: Finalizing metadata with Edge Function
      setUploadStage('FINALIZING');
      await finalizeUpload({
        tenantCompanyId: companyId,
        ...context
      });

      // Stage 5: Completed!
      setUploadStage('COMPLETED');
      setSuccessMsg(`Document "${docNameFinal}" uploaded and verified successfully.`);
      if (onSuccess) onSuccess(`Document "${docNameFinal}" uploaded and verified.`);

      // Refresh documents list
      await loadDocuments();

      // Auto-close modal after brief delay
      setTimeout(() => {
        setIsUploadModalOpen(false);
        resetUploadForm();
      }, 1500);

    } catch (err) {
      console.error('[CompanyDocumentsManager] Upload error:', err);
      const msg = err.message || 'Upload operation failed.';
      setUploadError(msg);

      // If error happened during FINALIZING, file is already safely in R2!
      if (uploadStage === 'FINALIZING' || (cachedUploadContext && uploadProgress === 100)) {
        setCanRetryFinalize(true);
      }
      setUploadStage('ERROR');
    }
  }

  // Retry only the finalize step if R2 PUT succeeded but finalize failed
  async function handleRetryFinalize() {
    if (!cachedUploadContext || !companyId) return;

    setUploadError('');
    setUploadStage('FINALIZING');

    try {
      await finalizeUpload({
        tenantCompanyId: companyId,
        ...cachedUploadContext
      });

      setUploadStage('COMPLETED');
      setSuccessMsg(`Document "${cachedUploadContext.documentName}" finalized successfully.`);
      await loadDocuments();

      setTimeout(() => {
        setIsUploadModalOpen(false);
        resetUploadForm();
      }, 1500);
    } catch (err) {
      console.error('[CompanyDocumentsManager] Retry finalize error:', err);
      setUploadError(err.message || 'Retry finalizing failed.');
      setCanRetryFinalize(true);
      setUploadStage('ERROR');
    }
  }

  // Preview Document Handler
  async function handlePreview(doc) {
    if (!doc?.id || !companyId) return;

    setPreviewState({
      isOpen: true,
      doc,
      url: '',
      isLoading: true,
      error: ''
    });

    try {
      const { download_url } = await createDownloadUrl({
        tenantCompanyId: companyId,
        documentId: doc.id
      });

      setPreviewState(prev => ({
        ...prev,
        url: download_url,
        isLoading: false,
        error: ''
      }));
    } catch (err) {
      console.error('[CompanyDocumentsManager] createDownloadUrl error for preview:', err);
      setPreviewState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to generate secure preview URL.'
      }));
    }
  }

  // Download Document Handler
  async function handleDownload(doc) {
    if (!doc?.id || !companyId) return;

    try {
      const { download_url, file_name } = await createDownloadUrl({
        tenantCompanyId: companyId,
        documentId: doc.id
      });

      // Trigger download via anchor element
      const link = document.createElement('a');
      link.href = download_url;
      link.download = file_name || doc.file_name || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[CompanyDocumentsManager] Download error:', err);
      const msg = err.message || 'Failed to download document.';
      setListError(msg);
      if (onError) onError(msg);
    }
  }

  // Archive Document Handler
  async function confirmArchiveDocument() {
    if (!archiveModalDoc || !companyId) return;

    setIsArchiving(true);
    setListError('');

    try {
      await archiveDocument({
        tenantCompanyId: companyId,
        documentId: archiveModalDoc.id
      });

      setSuccessMsg(`Document "${archiveModalDoc.document_name || archiveModalDoc.file_name}" archived successfully.`);
      setArchiveModalDoc(null);
      await loadDocuments();

      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('[CompanyDocumentsManager] Archive error:', err);
      const msg = err.message || 'Failed to archive document.';
      setListError(msg);
      if (onError) onError(msg);
    } finally {
      setIsArchiving(false);
    }
  }

  // Filtered Documents
  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (doc.document_name || '').toLowerCase().includes(q) ||
      (doc.document_number || '').toLowerCase().includes(q) ||
      (doc.file_name || '').toLowerCase().includes(q) ||
      (doc.document_type || '').toLowerCase().includes(q);

    // Type filter
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;

    // Status filter: active (not archived) vs archived
    const isArchived = Boolean(doc.is_archived);
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'archived' ? isArchived :
      !isArchived;

    // Verification status filter
    const vStatus = (doc.verification_status || 'pending').toLowerCase();
    const matchesVerification =
      verificationFilter === 'all' ? true :
      vStatus === verificationFilter;

    return matchesSearch && matchesType && matchesStatus && matchesVerification;
  });

  // Guard for newly created company without ID
  if (!companyId) {
    return (
      <div className="os-card p-8 text-center space-y-3 border-amber-500/30 bg-amber-500/5">
        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle size={22} />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Save Company to Enable Document Storage</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Please complete and save the company identity profile first. Cloudflare R2 document storage requires a registered tenant company identifier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 size={18} className="text-sky-500" />
            Company Document Management & Verification
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloudflare R2 secure object storage for statutory certificates, tax filings, and company records (up to 150 MB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={isLoading}
            className="os-secondary py-2 px-3 cursor-pointer"
            title="Refresh documents list"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={openUploadModal}
            className="os-primary py-2 px-4 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={15} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Global Alerts inside Document Tab */}
      {listError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{listError}</span>
          </div>
          <button onClick={() => setListError('')} className="p-1 hover:bg-rose-500/20 rounded">
            <X size={13} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-500/20 rounded">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="os-card p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document name, number, or filename..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border outline-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-sky-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Document Type Dropdown */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none cursor-pointer"
          >
            <option value="all">All Document Types</option>
            {DOCUMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Verification Status Dropdown */}
          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none cursor-pointer"
          >
            <option value="all">All Verifications</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Status Tabs: Active vs Archived */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {['active', 'archived', 'all'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'active' ? 'Current' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="os-card p-12 text-center text-xs text-slate-400 space-y-2">
          <RefreshCw size={24} className="animate-spin text-sky-500 mx-auto" />
          <p>Loading company documents from Cloudflare R2 storage...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="os-card p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'active'
                ? 'No documents match your filter criteria'
                : 'No company documents uploaded yet'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'active'
                ? 'Try adjusting your search query, type filters, or status tab to view other documents.'
                : `Upload official registrations, certificates, incorporation docs, and proofs for ${companyName}. Up to 150 MB per file.`}
            </p>
          </div>
          {(!searchQuery && typeFilter === 'all' && statusFilter === 'active') && (
            <button
              type="button"
              onClick={openUploadModal}
              className="os-primary mx-auto py-2 px-4 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Upload size={15} />
              <span>Upload First Document</span>
            </button>
          )}
        </div>
      ) : (
        <div className="os-card overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Document No.</th>
                  <th className="py-3 px-3">File Info</th>
                  <th className="py-3 px-3">Validity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDocuments.map(doc => {
                  const isArchived = Boolean(doc.is_archived);
                  const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
                  const vStatus = (doc.verification_status || 'verified').toLowerCase();

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition ${
                        isArchived ? 'opacity-65 bg-slate-50/30 dark:bg-slate-950/20' : ''
                      }`}
                    >
                      {/* Document Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                            {doc.mime_type?.includes('image') ? (
                              <ImageIcon size={17} />
                            ) : (
                              <FileText size={17} />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                              {doc.document_name || doc.file_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {doc.document_type || 'General'}
                        </span>
                      </td>

                      {/* Document Number */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                        {doc.document_number || '—'}
                      </td>

                      {/* File Info */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block text-[11px] line-clamp-1 max-w-[150px]">
                          {doc.file_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {formatBytes(doc.file_size_bytes || doc.file_size || 0)}
                        </span>
                      </td>

                      {/* Validity (Issue / Expiry) */}
                      <td className="py-3 px-3 text-[11px]">
                        {doc.expiry_date ? (
                          <div className="flex items-center gap-1">
                            <span className={`font-mono ${isExpired ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                              Exp: {doc.expiry_date}
                            </span>
                            {isExpired && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                EXPIRED
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Perpetual</span>
                        )}
                      </td>

                      {/* Status Badges */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          {isArchived ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1">
                              <Archive size={10} /> Archived
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                              vStatus === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : vStatus === 'rejected'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {vStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePreview(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 transition cursor-pointer"
                            title="Preview document"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                            title="Download file"
                          >
                            <Download size={15} />
                          </button>

                          {!isArchived && isOwner && (
                            <button
                              type="button"
                              onClick={() => setArchiveModalDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Archive document"
                            >
                              <Archive size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card List View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocuments.map(doc => {
              const isArchived = Boolean(doc.is_archived);
              const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
              const vStatus = (doc.verification_status || 'verified').toLowerCase();

              return (
                <div key={doc.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                        {doc.mime_type?.includes('image') ? <ImageIcon size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {doc.document_name || doc.file_name}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {doc.file_name} ({formatBytes(doc.file_size_bytes || doc.file_size || 0)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          Archived
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                          vStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {vStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {doc.document_type || 'General'}
                    </span>
                    {doc.document_number && (
                      <span className="font-mono bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        {doc.document_number}
                      </span>
                    )}
                    {doc.expiry_date && (
                      <span className={isExpired ? 'text-rose-500 font-bold' : ''}>
                        Exp: {doc.expiry_date}
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => handlePreview(doc)}
                      className="os-secondary py-1.5 px-2.5 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="os-secondary py-1.5 px-2.5 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={13} /> Download
                    </button>
                    {!isArchived && isOwner && (
                      <button
                        type="button"
                        onClick={() => setArchiveModalDoc(doc)}
                        className="py-1.5 px-2 text-[11px] text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Archive size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UPLOAD MODAL & LIFECYCLE */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="os-card p-6 max-w-xl w-full space-y-5 shadow-2xl border-slate-200 dark:border-slate-800 my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Upload Company Document</h4>
                  <p className="text-[11px] text-slate-400">Direct-to-R2 signed upload with backend verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUploadModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error in Upload Modal */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{uploadError}</p>
                    {canRetryFinalize && (
                      <p className="text-[11px] text-rose-500/80 mt-1">
                        Note: The file was safely uploaded to Cloudflare R2, but the metadata finalization failed. You can retry finalizing without uploading the file again.
                      </p>
                    )}
                  </div>
                </div>
                {canRetryFinalize && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetryFinalize}
                      className="os-primary py-1 px-3 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Retry Finalizing
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* UPLOAD PROGRESS / STATE PIPELINE */}
            {uploadStage !== 'IDLE' && uploadStage !== 'SELECTED' && (
              <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                    {uploadStage === 'PREPARING' && 'Preparing upload & validating parameters...'}
                    {uploadStage === 'REQUESTING_URL' && 'Requesting secure R2 upload authorization...'}
                    {uploadStage === 'UPLOADING' && `Uploading file to Cloudflare R2 (${uploadProgress}%)...`}
                    {uploadStage === 'FINALIZING' && 'Finalizing document & verifying metadata in backend...'}
                    {uploadStage === 'COMPLETED' && 'Upload completed and verified!'}
                    {uploadStage === 'ERROR' && 'Upload interrupted'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {uploadStage === 'UPLOADING'
                      ? `${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`
                      : uploadStage === 'COMPLETED'
                      ? '100%'
                      : ''}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      uploadStage === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : uploadStage === 'ERROR'
                        ? 'bg-rose-500'
                        : 'bg-sky-500'
                    }`}
                    style={{
                      width:
                        uploadStage === 'COMPLETED' ? '100%' :
                        uploadStage === 'UPLOADING' ? `${uploadProgress}%` :
                        uploadStage === 'FINALIZING' ? '95%' :
                        uploadStage === 'REQUESTING_URL' ? '25%' :
                        uploadStage === 'PREPARING' ? '10%' : '5%'
                    }}
                  />
                </div>

                {/* Pipeline Step Indicators */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center text-slate-400">
                  <div className={['REQUESTING_URL', 'UPLOADING', 'FINALIZING', 'COMPLETED'].includes(uploadStage) ? 'text-sky-500 font-black' : ''}>
                    1. Secure URL
                  </div>
                  <div className={['UPLOADING', 'FINALIZING', 'COMPLETED'].includes(uploadStage) ? 'text-sky-500 font-black' : ''}>
                    2. R2 Upload
                  </div>
                  <div className={['FINALIZING', 'COMPLETED'].includes(uploadStage) ? 'text-sky-500 font-black' : ''}>
                    3. Finalize
                  </div>
                  <div className={uploadStage === 'COMPLETED' ? 'text-emerald-500 font-black' : ''}>
                    4. Verified
                  </div>
                </div>
              </div>
            )}

            {/* Dropzone & Form (Visible when not actively uploading or in error/selected state) */}
            {uploadStage !== 'UPLOADING' && uploadStage !== 'FINALIZING' && uploadStage !== 'COMPLETED' && (
              <div className="space-y-4">
                {/* Drag and drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center space-y-3 cursor-pointer transition ${
                    isDragOver
                      ? 'border-sky-500 bg-sky-500/10'
                      : selectedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-sky-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
                    <Upload size={20} />
                  </div>
                  <div>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                          Selected: {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          Size: {formatBytes(selectedFile.size)} | Click to replace file
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Drag & drop company document here or click to browse
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Supports PDF, PNG, JPG, DOCX, XLSX, TXT up to 150 MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Metadata Form */}
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="os-label">Document Type *</label>
                      <select
                        value={formDocType}
                        onChange={e => setFormDocType(e.target.value)}
                        className="os-input cursor-pointer"
                      >
                        {DOCUMENT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {formDocType === 'Other' && (
                      <div>
                        <label className="os-label">Specify Document Type</label>
                        <input
                          type="text"
                          placeholder="e.g. Environmental Clearance"
                          value={customDocType}
                          onChange={e => setCustomDocType(e.target.value)}
                          className="os-input"
                        />
                      </div>
                    )}

                    <div className={formDocType === 'Other' ? 'sm:col-span-2' : ''}>
                      <label className="os-label">Document Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. GST Registration Certificate"
                        value={formDocName}
                        onChange={e => setFormDocName(e.target.value)}
                        className="os-input"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="os-label">Document Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 36AAAAA0000A1Z5"
                        value={formDocNumber}
                        onChange={e => setFormDocNumber(e.target.value)}
                        className="os-input font-mono"
                      />
                    </div>
                    <div>
                      <label className="os-label">Issue Date</label>
                      <input
                        type="date"
                        value={formIssueDate}
                        onChange={e => setFormIssueDate(e.target.value)}
                        className="os-input"
                      />
                    </div>
                    <div>
                      <label className="os-label">Expiry Date</label>
                      <input
                        type="date"
                        value={formExpiryDate}
                        onChange={e => setFormExpiryDate(e.target.value)}
                        className="os-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="os-label">Notes / Description (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Add any internal statutory notes or filing remarks..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="os-input resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={uploadStage === 'UPLOADING' || uploadStage === 'FINALIZING'}
                className="os-secondary py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>

              {uploadStage !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={handleStartUpload}
                  disabled={!selectedFile || uploadStage === 'UPLOADING' || uploadStage === 'FINALIZING'}
                  className="os-primary py-2 px-5 flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Upload size={14} />
                  <span>Start Secure Upload</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewState.isOpen && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="os-card p-5 max-w-4xl w-full h-[85vh] flex flex-col space-y-4 shadow-2xl border-slate-200 dark:border-slate-800">
            {/* Preview Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Eye size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                    {previewState.doc?.document_name || previewState.doc?.file_name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {previewState.doc?.document_type} • {formatBytes(previewState.doc?.file_size_bytes || previewState.doc?.file_size || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewState.url && (
                  <>
                    <a
                      href={previewState.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="os-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden sm:inline">Open in Tab</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(previewState.doc)}
                      className="os-primary py-1 px-3 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewState({ isOpen: false, doc: null, url: '', isLoading: false, error: '' })}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Preview Content Area */}
            <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 overflow-hidden relative flex items-center justify-center">
              {previewState.isLoading ? (
                <div className="text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-sky-500 mx-auto" />
                  <p>Generating temporary secure preview link...</p>
                </div>
              ) : previewState.error ? (
                <div className="p-6 text-center text-xs text-rose-500 space-y-2 max-w-sm">
                  <AlertCircle size={24} className="mx-auto" />
                  <p className="font-bold">Failed to load preview</p>
                  <p className="text-slate-400">{previewState.error}</p>
                </div>
              ) : previewState.doc?.mime_type?.includes('image') ? (
                <img
                  src={previewState.url}
                  alt={previewState.doc?.document_name}
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : previewState.doc?.mime_type?.includes('pdf') ? (
                <iframe
                  src={previewState.url}
                  title={previewState.doc?.document_name}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-8 text-center space-y-3 max-w-md">
                  <FileText size={40} className="text-sky-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Preview not available directly in browser
                  </h4>
                  <p className="text-xs text-slate-400">
                    This file format ({previewState.doc?.mime_type || 'binary'}) cannot be rendered in-line. Please download or open it in a dedicated application.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownload(previewState.doc)}
                    className="os-primary py-2 px-4 mx-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {archiveModalDoc && (
        <div className="fixed inset-0 z-[130] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="os-card p-6 max-w-md w-full space-y-4 shadow-2xl border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Archive size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Archive Company Document?</h4>
                <p className="text-[11px] text-slate-400">This action will update metadata and remove active file availability.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1 font-medium">
              <div><strong className="text-slate-400">Document:</strong> {archiveModalDoc.document_name || archiveModalDoc.file_name}</div>
              <div><strong className="text-slate-400">Type:</strong> {archiveModalDoc.document_type}</div>
              {archiveModalDoc.document_number && <div><strong className="text-slate-400">Number:</strong> {archiveModalDoc.document_number}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setArchiveModalDoc(null)}
                disabled={isArchiving}
                className="os-secondary py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmArchiveDocument}
                disabled={isArchiving}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isArchiving ? <RefreshCw size={14} className="animate-spin" /> : <Archive size={14} />}
                <span>{isArchiving ? 'Archiving...' : 'Confirm Archive'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
