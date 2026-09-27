import React, { useState } from 'react';
import {
  X,
  FileCode2,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  DollarSign,
  Cpu,
  Layers
} from 'lucide-react';

export default function RawExtractionModal({
  isOpen,
  onClose,
  rawOutput,
  extractionJob = null,
  isDarkMode = false
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'json'

  if (!isOpen || !rawOutput) return null;

  const doc = rawOutput.document || {};
  const lines = Array.isArray(rawOutput.lines) ? rawOutput.lines : [];
  const totals = rawOutput.totals || {};
  const metadata = rawOutput.metadata || {};
  const warnings = Array.isArray(rawOutput.warnings) ? rawOutput.warnings : [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tCard = isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const tHeader = isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200';
  const tTabActive = isDarkMode ? 'bg-sky-500 text-white' : 'bg-sky-600 text-white';
  const tTabInactive = isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${tCard}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <FileCode2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Raw Extraction Envelope</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  v{rawOutput.schema_version || '1.0'}
                </span>
                {metadata.strategy && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {metadata.strategy}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Provider-neutral contract envelope for job {extractionJob?.id ? extractionJob.id.slice(0, 8) : 'output'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
              title="Copy envelope JSON"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'summary' ? tTabActive : tTabInactive
            }`}
          >
            <Layers size={13} /> Structured Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'json' ? tTabActive : tTabInactive
            }`}
          >
            <FileCode2 size={13} /> Raw JSON Envelope
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'summary' ? (
            <>
              {/* Warnings Banner if any */}
              {warnings.length > 0 && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
                    <span>Contract Warnings ({warnings.length})</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-700 dark:text-amber-400 pl-1 space-y-0.5">
                    {warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document Header & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Metadata */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} /> Document Header
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Type</span>
                      <span className="font-semibold">{doc.document_type || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document No.</span>
                      <span className="font-semibold font-mono">{doc.document_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vendor</span>
                      <span className="font-semibold">{doc.vendor_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date</span>
                      <span className="font-semibold">{doc.document_date || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Title / Project</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {doc.title || doc.project_name || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Totals & Operational Metadata */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign size={13} /> Totals & Commercial
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Currency</span>
                      <span className="font-semibold">{totals.currency || 'INR'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Subtotal</span>
                      <span className="font-semibold">
                        {totals.subtotal !== null && totals.subtotal !== undefined
                          ? `₹${Number(totals.subtotal).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tax Amount</span>
                      <span className="font-semibold">
                        {totals.tax_amount !== null && totals.tax_amount !== undefined
                          ? `₹${Number(totals.tax_amount).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Grand Total</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {totals.grand_total !== null && totals.grand_total !== undefined
                          ? `₹${Number(totals.grand_total).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Metadata */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu size={13} /> Worker Execution Metadata
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Provider</span>
                    <span className="font-mono font-semibold">{metadata.provider || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Model</span>
                    <span className="font-mono">{metadata.model_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Worker ID</span>
                    <span className="font-mono">{metadata.worker_id || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Processed At</span>
                    <span>{metadata.processed_at ? new Date(metadata.processed_at).toLocaleString() : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Raw Lines Count Info */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers size={14} className="text-sky-500" />
                    <span>Raw Extraction Lines ({lines.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 italic">
                    Raw verbatim lines (Phase 4A contract verified)
                  </span>
                </div>
                {lines.length === 0 ? (
                  <p className="text-slate-400 text-xs italic mt-2">
                    Zero extraction lines generated in Phase 4A contract mode (AI extraction intentionally deactivated).
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold text-[10px] uppercase">
                          <th className="py-1.5 px-2">#</th>
                          <th className="py-1.5 px-2">Description</th>
                          <th className="py-1.5 px-2">Qty</th>
                          <th className="py-1.5 px-2">UOM</th>
                          <th className="py-1.5 px-2">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lines.map((l, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-2">{l.line_no || i + 1}</td>
                            <td className="py-1.5 px-2 max-w-[200px] truncate">{l.raw_description}</td>
                            <td className="py-1.5 px-2">{l.quantity ?? '—'}</td>
                            <td className="py-1.5 px-2">{l.uom || '—'}</td>
                            <td className="py-1.5 px-2">{l.unit_rate ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto bg-slate-950 text-slate-200 max-h-[500px]">
                {JSON.stringify(rawOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
