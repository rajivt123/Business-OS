import React, { useState } from 'react';
import { X, Tag, CheckCircle2, AlertCircle, Plus, Loader2, ShieldCheck, Bookmark, ExternalLink } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function ItemAliasModal({ item, isOpen, onClose, isDarkMode }) {
  const { itemAliases = [], createInventoryItemAlias, submitting, isManagementOrAdmin } = useInventory();
  
  const [aliasText, setAliasText] = useState('');
  const [aliasType, setAliasType] = useState('vendor');
  const [isVerified, setIsVerified] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !item) return null;

  const aliases = itemAliases.filter(a => a.inventory_item_id === item.id);

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleAddAlias = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!aliasText.trim()) {
      setErrorMsg('Alias text is required');
      return;
    }

    const res = await createInventoryItemAlias({
      inventory_item_id: item.id,
      alias_text: aliasText.trim(),
      alias_type: aliasType,
      is_verified: isVerified
    });

    if (res.success) {
      setAliasText('');
      setSuccessMsg('Alias added successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to create alias');
    }
  };

  const getAliasTypeBadge = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'vendor':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'customer':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'catalog':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'synonym':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'site':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[700px] w-full max-h-[90vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Item Identity & Aliases</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {item.item_code}
                </span>
                {item.domain_code && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {item.domain_code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Item Identity Context */}
          <div className={`p-4 rounded-xl border ${tSection} space-y-2`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold">{item.category || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Base UOM</span>
                <span className="font-mono font-semibold">{item.base_uom_code || 'NOS'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Item Type</span>
                <span className="capitalize">{item.item_type?.replace('_', ' ') || 'Raw Material'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  item.is_active ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {item.normalized_name && (
              <div className="pt-2 border-t border-slate-800/40 text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Canonical Normalized Name</span>
                <span className="font-mono text-amber-400/90 text-xs">{item.normalized_name}</span>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add Alias Form (Management / Admin only) */}
          {isManagementOrAdmin ? (
            <form onSubmit={handleAddAlias} className={`p-4 rounded-xl border ${tSection} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add New Known Alias
                </h3>
                <span className="text-[10px] text-slate-500">Atomic RPC write</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block text-[11px] font-semibold mb-1 ${tLabel}`}>
                    Alias Text / Vendor Part Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={aliasText}
                    onChange={(e) => setAliasText(e.target.value)}
                    placeholder="e.g. Jindal MS Pipe 4 inch ERW Heavy Class C"
                    className={`w-full rounded-lg px-3 py-2 text-xs border ${tInput}`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${tLabel}`}>
                    Alias Type
                  </label>
                  <select
                    value={aliasType}
                    onChange={(e) => setAliasType(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs border ${tInput}`}
                  >
                    <option value="vendor">Vendor</option>
                    <option value="customer">Customer</option>
                    <option value="catalog">Catalog</option>
                    <option value="synonym">Synonym</option>
                    <option value="site">Site / Field</option>
                    <option value="legacy">Legacy</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-400">Mark as verified alias</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !aliasText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add Alias
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className={`p-3 rounded-lg border text-xs text-slate-500 ${tSection}`}>
              Read-only view: Only inventory managers and administrators can create new item aliases.
            </div>
          )}

          {/* Known Aliases List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" /> Known Aliases ({aliases.length})
              </h3>
            </div>

            {aliases.length === 0 ? (
              <div className={`p-6 rounded-xl border text-center text-xs text-slate-500 ${tSection}`}>
                <Tag className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No aliases registered for this item yet.</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Aliases allow vendor quotations, PO descriptions, and BOQ lines to resolve to this canonical inventory item.
                </p>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden divide-y divide-slate-800/40 ${tSection}`}>
                {aliases.map((alias) => (
                  <div key={alias.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200">{alias.alias_text}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getAliasTypeBadge(alias.alias_type)}`}>
                          {alias.alias_type}
                        </span>
                        {alias.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </div>

                      {alias.normalized_alias && alias.normalized_alias !== alias.alias_text && (
                        <p className="font-mono text-[10px] text-slate-500">
                          normalized: {alias.normalized_alias}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[10px] text-slate-500 shrink-0">
                      <div>Source: <span className="capitalize font-medium text-slate-400">{alias.source_type || 'manual'}</span></div>
                      {alias.created_at && (
                        <div>{new Date(alias.created_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex justify-end shrink-0 ${tHeader}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
