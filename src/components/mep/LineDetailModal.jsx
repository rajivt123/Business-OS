import React, { useState } from 'react';
import {
  X,
  FileText,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Layers,
  Hash,
  Database,
  Calendar,
  User,
  History,
  Code,
  DollarSign
} from 'lucide-react';
import { getUserDisplayName } from '../../context/CrmContext';

export default function LineDetailModal({
  isOpen,
  onClose,
  line,
  corrections = [],
  items = [],
  domains = [],
  categories = [],
  profiles = [],
  tenantMembers = [],
  isDarkMode = false
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen || !line) return null;

  // Resolve domain and category
  const domain = domains.find(d => d.code === line.domain_code || d.domain_code === line.domain_code);
  const category = categories.find(c => c.id === line.category_id);
  const candidateItem = items.find(i => i.id === line.candidate_inventory_item_id);

  // Line corrections
  const lineCorrections = corrections.filter(c => c.extraction_line_id === line.id);

  // Review status badge formatting
  const getReviewStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved' || s === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
          <AlertCircle size={12} /> Rejected
        </span>
      );
    }
    if (s === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
          <CheckCircle2 size={12} /> Reviewed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
        <Clock size={12} /> Pending Review
      </span>
    );
  };

  // Confidence formatter
  const formatConfidence = (conf) => {
    if (conf === null || conf === undefined || conf === '') return '—';
    const num = Number(conf);
    if (isNaN(num)) return String(conf);
    const pct = num <= 1 ? Math.round(num * 100) : Math.round(num);
    return `${pct}%`;
  };

  const getConfidenceTone = (conf) => {
    if (conf === null || conf === undefined) return 'text-slate-500';
    const num = Number(conf) <= 1 ? Number(conf) * 100 : Number(conf);
    if (num >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (num >= 65) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
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

  // Safe attribute render
  const renderParsedAttributes = () => {
    const attrs = line.parsed_attributes;
    if (!attrs) {
      return (
        <p className="text-xs text-slate-400 italic">No parsed attributes extracted for this line.</p>
      );
    }

    if (typeof attrs === 'object' && !Array.isArray(attrs)) {
      const keys = Object.keys(attrs);
      if (keys.length === 0) {
        return <p className="text-xs text-slate-400 italic">No parsed attributes in payload.</p>;
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {keys.map((key) => {
            const val = attrs[key];
            const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return (
              <div
                key={key}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs flex flex-col justify-between"
              >
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-medium mt-0.5 break-all">
                  {displayVal || '—'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <pre className="p-3 bg-slate-950 text-slate-200 text-xs rounded-lg overflow-x-auto font-mono">
        {JSON.stringify(attrs, null, 2)}
      </pre>
    );
  };

  // Safe match reasons render
  const renderMatchReasons = () => {
    const reasons = line.match_reasons;
    if (!reasons) {
      return <p className="text-xs text-slate-400 italic">No match reasoning recorded.</p>;
    }

    if (Array.isArray(reasons)) {
      if (reasons.length === 0) {
        return <p className="text-xs text-slate-400 italic">Empty match reasoning list.</p>;
      }
      return (
        <ul className="space-y-1.5">
          {reasons.map((r, idx) => (
            <li key={idx} className="text-xs flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
              <span>{typeof r === 'object' ? JSON.stringify(r) : String(r)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof reasons === 'object') {
      return (
        <div className="space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {Object.entries(reasons).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-0.5">
              <span className="text-slate-500 dark:text-slate-400">{k}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
        {typeof reasons === 'object' ? JSON.stringify(reasons) : String(reasons)}
      </p>
    );
  };

  const tCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border ${tCard} overflow-hidden`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm">
              #{line.line_no || '—'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Extraction Line Detail
                </h3>
                {getReviewStatusBadge(line.review_status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Page {line.source_page ?? '—'}</span>
                <span>•</span>
                <span>Item Type: <strong className="font-semibold text-slate-700 dark:text-slate-300">{line.item_type || '—'}</strong></span>
                <span>•</span>
                <span>Domain: <strong className="font-semibold text-slate-700 dark:text-slate-300">{domain?.name || line.domain_code || '—'}</strong></span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close line detail"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Original Raw Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText size={14} className="text-sky-500" /> Original Raw Description
              </label>
              {line.source_page && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Source Page: {line.source_page}
                </span>
              )}
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-all">
              {line.raw_description || <span className="text-slate-400 italic">No raw description recorded</span>}
            </div>
          </div>

          {/* Section 2: Normalized & Classification Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag size={14} className="text-violet-500" /> Normalized Intelligence
              </h4>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Normalized Description</div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {line.normalized_description || <span className="text-slate-400 font-normal italic">Not normalized</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Material Code</div>
                  <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                    {line.material_code || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Vendor Mat #</div>
                  <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                    {line.vendor_material_number || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Domain</div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {domain?.name || line.domain_code || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {category?.name || line.category_id || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax & Commercial Info */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" /> Quantity, Tax & Commercials
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Quantity</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {line.quantity !== null && line.quantity !== undefined ? line.quantity : '—'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">UOM</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {line.uom_code || '—'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Unit Rate</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {line.unit_rate !== null && line.unit_rate !== undefined ? `₹${Number(line.unit_rate).toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">HSN / SAC Code</div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {line.hsn_code || '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Line Value</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {line.quantity && line.unit_rate
                      ? `₹${(Number(line.quantity) * Number(line.unit_rate)).toLocaleString()}`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Candidate Inventory Item Match */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Database size={14} className="text-blue-500" /> Candidate Inventory Item Match
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Match Method: <strong className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{line.match_method || 'NONE'}</strong>
                </span>
                <span className={`text-xs font-bold ${getConfidenceTone(line.match_confidence)}`}>
                  Confidence: {formatConfidence(line.match_confidence)}
                </span>
              </div>
            </div>

            {candidateItem ? (
              <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {candidateItem.item_code}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {candidateItem.item_name}
                    </div>
                    {candidateItem.normalized_name && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Canonical Normalized: <span className="font-medium text-slate-700 dark:text-slate-300">{candidateItem.normalized_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      ID: {candidateItem.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            ) : line.candidate_inventory_item_id ? (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
                <span className="text-slate-500">Candidate Item ID: </span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{line.candidate_inventory_item_id}</span>
                <span className="text-slate-400 block mt-1">(Item details not cached locally)</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-500 text-center">
                No inventory item matched for this line.
              </div>
            )}

            {/* Match Reasons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                <HelpCircle size={12} /> Match Reasons / Scoring Evidence
              </div>
              {renderMatchReasons()}
            </div>
          </div>

          {/* Section 4: Parsed Attributes */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-500" /> Parsed Attributes (Payload)
              </h4>
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Code size={12} /> {showRawJson ? 'View Structured' : 'View Raw JSON'}
              </button>
            </div>
            {showRawJson ? (
              <pre className="p-3 bg-slate-950 text-slate-200 text-xs rounded-lg overflow-x-auto font-mono max-h-60">
                {JSON.stringify(line.parsed_attributes, null, 2)}
              </pre>
            ) : (
              renderParsedAttributes()
            )}
          </div>

          {/* Section 5: AI Corrections (View 6) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <History size={14} className="text-purple-500" /> AI Corrections for This Line
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                {lineCorrections.length} correction{lineCorrections.length !== 1 ? 's' : ''}
              </span>
            </div>

            {lineCorrections.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 italic">
                No AI corrections recorded for this extraction line.
              </div>
            ) : (
              <div className="space-y-3">
                {lineCorrections.map((corr) => {
                  const reviewerName = getUserDisplayName(corr.reviewer_id, profiles, tenantMembers);
                  return (
                    <div
                      key={corr.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px]">
                            {corr.field_name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <User size={12} /> {reviewerName}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Calendar size={12} /> {new Date(corr.created_at).toLocaleString()}
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

                      {/* Reason */}
                      {corr.correction_reason && (
                        <div className="text-slate-600 dark:text-slate-400 text-xs italic bg-white dark:bg-slate-950/40 p-2 rounded border border-slate-100 dark:border-slate-800">
                          &ldquo;{corr.correction_reason}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Hash size={12} />
            <span>ID: <code className="text-slate-600 dark:text-slate-300">{line.id}</code></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
