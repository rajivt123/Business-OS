import React, { useState } from 'react';
import { X, Loader2, MapPin, Building, FolderTree, CheckCircle2 } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function LocationModal({ isOpen, onClose, isDarkMode }) {
  const { locations, createLocation, submitting } = useInventory();
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    location_code: '',
    location_name: '',
    location_type: 'Warehouse',
    parent_location_id: '',
    is_stock_location: true,
    is_active: true
  });

  if (!isOpen) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.location_code.trim()) {
      setErrorMsg('Location code is required');
      return;
    }
    if (!form.location_name.trim()) {
      setErrorMsg('Location name is required');
      return;
    }

    const res = await createLocation(form);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create location');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[700px] w-full max-h-[90vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Inventory Location</h2>
              <p className="text-xs text-slate-500">Add a warehouse, site store, or virtual location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form id="location-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" /> Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Location Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_code"
                  value={form.location_code}
                  onChange={handleChange}
                  placeholder="e.g. QA-WH-MAIN"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_name"
                  value={form.location_name}
                  onChange={handleChange}
                  placeholder="e.g. Main Central Warehouse"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Location Type
                </label>
                <select
                  name="location_type"
                  value={form.location_type}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="Warehouse">Warehouse</option>
                  <option value="Store">Store</option>
                  <option value="Site">Site</option>
                  <option value="Virtual">Virtual Location</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Parent Location (Optional)
                </label>
                <select
                  name="parent_location_id"
                  value={form.parent_location_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="">None (Top-level Location)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_code} - {loc.location_name} ({loc.location_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/40 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
                <input
                  type="checkbox"
                  name="is_stock_location"
                  checked={form.is_stock_location}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Stock Location (Can hold physical stock)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Active Location</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${tHeader}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="location-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Location...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Save Location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
