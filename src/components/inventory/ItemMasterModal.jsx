import React, { useState } from 'react';
import { X, Loader2, Package, Tag, Layers, Scale, Hash, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function ItemMasterModal({ isOpen, onClose, isDarkMode }) {
  const { createItem, submitting } = useInventory();
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    item_code: '',
    name: '',
    description: '',
    category: 'Pipes & Fittings',
    item_type: 'raw_material',
    base_uom_code: 'MTR',
    hsn_sac_code: '',
    reorder_level: '100',
    reorder_quantity: '200',
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

    if (!form.item_code.trim()) {
      setErrorMsg('Item code is required');
      return;
    }
    if (!form.name.trim()) {
      setErrorMsg('Item name is required');
      return;
    }

    const res = await createItem(form);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create item');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[850px] w-full max-h-[90vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Inventory Item Master</h2>
              <p className="text-xs text-slate-500">Define raw material, finished product, or consumable item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="item-master-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Basic Item Info */}
          <div className={`p-4 rounded-xl border ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Item Identification & Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Item Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="item_code"
                  value={form.item_code}
                  onChange={handleChange}
                  placeholder="e.g. PIPE-100-MS"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. MS Black Steel Pipe 100mm"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Detailed specifications, standards, or dimensions..."
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>
            </div>
          </div>

          {/* Classification & Unit */}
          <div className={`p-4 rounded-xl border ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Classification & Measuring Units
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Pipes & Fittings, Valves, Sprinklers"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Item Type
                </label>
                <select
                  name="item_type"
                  value={form.item_type}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="finished_good">Finished Good</option>
                  <option value="consumable">Consumable</option>
                  <option value="service">Service</option>
                  <option value="sub_assembly">Sub Assembly</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Base UOM
                </label>
                <select
                  name="base_uom_code"
                  value={form.base_uom_code}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="MTR">MTR (Meters)</option>
                  <option value="NOS">NOS (Numbers)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="LTR">LTR (Liters)</option>
                  <option value="SET">SET (Sets)</option>
                  <option value="BOX">BOX (Boxes)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  HSN / SAC Code
                </label>
                <input
                  type="text"
                  name="hsn_sac_code"
                  value={form.hsn_sac_code}
                  onChange={handleChange}
                  placeholder="e.g. 7306"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Reorder Level
                </label>
                <input
                  type="number"
                  name="reorder_level"
                  value={form.reorder_level}
                  onChange={handleChange}
                  min="0"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Reorder Quantity
                </label>
                <input
                  type="number"
                  name="reorder_quantity"
                  value={form.reorder_quantity}
                  onChange={handleChange}
                  min="0"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center shrink-0 ${tHeader}`}>
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Active Item</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="item-master-form"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Item...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
