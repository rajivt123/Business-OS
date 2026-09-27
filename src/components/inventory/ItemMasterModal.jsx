import React, { useState } from 'react';
import { X, Loader2, Package, Tag, Layers, Scale, Hash, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function ItemMasterModal({ isOpen, onClose, isDarkMode }) {
  const { createItem, submitting, mepDomains = [], mepCategories = [], mepAttributes = [] } = useInventory();
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
    domain_code: '',
    mep_category_id: '',
    normalized_name: '',
    is_active: true
  });

  const [identityAttributes, setIdentityAttributes] = useState({});
  const [selectedAttrToAdd, setSelectedAttrToAdd] = useState('');

  const DEFAULT_MEP_ATTRIBUTES = [
    { code: 'NOMINAL_SIZE', key: 'nominal_size', name: 'Nominal Size', placeholder: 'e.g. 100 mm / 4 inch' },
    { code: 'MATERIAL', key: 'material', name: 'Material', placeholder: 'e.g. CI, DI, MS, SS304' },
    { code: 'CONNECTION', key: 'connection', name: 'Connection / End Type', placeholder: 'e.g. Flanged, Grooved, Threaded' },
    { code: 'PRESSURE_CLASS', key: 'pressure_class', name: 'Pressure Class', placeholder: 'e.g. PN16, Class 150, Class 300' },
    { code: 'RATING', key: 'rating', name: 'Rating', placeholder: 'e.g. 16 Bar, 25 Bar' },
    { code: 'STANDARD', key: 'standard', name: 'Applicable Standard', placeholder: 'e.g. IS 14846, BS 5163, ASTM A53' },
    { code: 'MAKE', key: 'make', name: 'Make / Manufacturer', placeholder: 'e.g. Jindal, Kirloskar, HD Fire' },
    { code: 'MODEL', key: 'model', name: 'Model / Part Number', placeholder: 'e.g. GV-100-F' },
    { code: 'SCHEDULE', key: 'schedule', name: 'Schedule / Thickness Class', placeholder: 'e.g. Sch 40, Heavy Class C' },
    { code: 'ORIENTATION', key: 'orientation', name: 'Orientation', placeholder: 'e.g. Horizontal, Vertical, Pendent' },
    { code: 'TEMPERATURE_RATING', key: 'temperature_rating', name: 'Temperature Rating', placeholder: 'e.g. 68°C, 93°C' },
    { code: 'K_FACTOR', key: 'k_factor', name: 'K Factor', placeholder: 'e.g. K5.6, K8.0, K11.2' },
    { code: 'ACTUATION', key: 'actuation', name: 'Actuation', placeholder: 'e.g. OS&Y, Handwheel, Lever, Gear' },
    { code: 'APPLICATION', key: 'application', name: 'Application / Service', placeholder: 'e.g. Fire Protection, Water' },
    { code: 'COLOR_FINISH', key: 'colour_finish', name: 'Colour / Finish', placeholder: 'e.g. Red, Chrome, Zinc Plated' }
  ];

  // Dynamic attribute definitions from mep_attribute_definitions or default fallback
  const attributeDefinitions = React.useMemo(() => {
    if (mepAttributes && mepAttributes.length > 0) {
      const filtered = mepAttributes.filter(a => {
        const matchDomain = !a.domain_code || !form.domain_code || a.domain_code === form.domain_code;
        const matchCat = !a.category_id || !form.mep_category_id || a.category_id === form.mep_category_id;
        return matchDomain && matchCat;
      });
      const source = filtered.length > 0 ? filtered : mepAttributes;
      return source.map(a => {
        const normKey = a.code?.toLowerCase() === 'color_finish' ? 'colour_finish' : (a.code?.toLowerCase() || a.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        const fallback = DEFAULT_MEP_ATTRIBUTES.find(d => d.code === a.code || d.key === normKey);
        return {
          code: a.code || normKey.toUpperCase(),
          key: normKey,
          name: a.name || fallback?.name || normKey,
          placeholder: fallback?.placeholder || `Enter ${a.name}...`
        };
      });
    }
    return DEFAULT_MEP_ATTRIBUTES;
  }, [mepAttributes, form.domain_code, form.mep_category_id]);

  // Dynamic MEP categories filtered by selected domain
  const filteredCategories = React.useMemo(() => {
    if (!form.domain_code) return [];
    return mepCategories.filter(cat => cat.domain_code === form.domain_code);
  }, [mepCategories, form.domain_code]);

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

  const handleDomainChange = (e) => {
    const newDomain = e.target.value;
    setForm(prev => {
      const isValid = mepCategories.some(c => c.domain_code === newDomain && c.id === prev.mep_category_id);
      return {
        ...prev,
        domain_code: newDomain,
        mep_category_id: isValid ? prev.mep_category_id : ''
      };
    });
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = mepCategories.find(c => c.id === catId);
    setForm(prev => ({
      ...prev,
      mep_category_id: catId,
      category: selectedCat ? selectedCat.name : prev.category
    }));
  };

  const handleAttributeChange = (key, val) => {
    setIdentityAttributes(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleRemoveAttribute = (key) => {
    setIdentityAttributes(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleAddAttribute = (key) => {
    if (!key) return;
    setIdentityAttributes(prev => ({
      ...prev,
      [key]: prev[key] || ''
    }));
    setSelectedAttrToAdd('');
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

    // Filter only non-empty attribute values
    const cleanIdentityAttributes = {};
    Object.entries(identityAttributes).forEach(([k, v]) => {
      if (typeof v === 'string' && v.trim()) {
        cleanIdentityAttributes[k] = v.trim();
      } else if (v !== null && v !== undefined && v !== '') {
        cleanIdentityAttributes[k] = v;
      }
    });

    const submitPayload = {
      ...form,
      domain_code: form.domain_code || null,
      mep_category_id: form.mep_category_id || null,
      normalized_name: form.normalized_name?.trim() || null,
      identity_attributes: Object.keys(cleanIdentityAttributes).length > 0 ? cleanIdentityAttributes : {}
    };

    const res = await createItem(submitPayload);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create item');
    }
  };

  // Primary attributes always shown initially; other attributes can be added via dropdown
  const PRIMARY_ATTRIBUTE_KEYS = ['nominal_size', 'material', 'connection', 'pressure_class', 'rating', 'standard'];
  const displayedAttributes = attributeDefinitions.filter(
    a => PRIMARY_ATTRIBUTE_KEYS.includes(a.key) || identityAttributes[a.key] !== undefined
  );
  const remainingAttributes = attributeDefinitions.filter(
    a => !displayedAttributes.some(d => d.key === a.key)
  );

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
                  General Category
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

          {/* MEP Engineering Foundation (Dynamic Domains, Categories & Attributes) */}
          <div className={`p-4 rounded-xl border ${tSection} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Package className="w-4 h-4" /> MEP Engineering Identity & Categorization
              </h3>
              <span className="text-[10px] text-slate-500">Global Reference & Standard Hierarchy</span>
            </div>

            {/* Domain & Dynamic MEP Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  MEP Domain
                </label>
                <select
                  name="domain_code"
                  value={form.domain_code}
                  onChange={handleDomainChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="">-- None / General --</option>
                  {mepDomains.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.name || d.code}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Classifies item into standard engineering domain</p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  MEP Category
                </label>
                <select
                  name="mep_category_id"
                  value={form.mep_category_id}
                  onChange={handleCategoryChange}
                  disabled={!form.domain_code}
                  className={`w-full rounded-lg px-3 py-2 text-sm border disabled:opacity-50 ${tInput}`}
                >
                  <option value="">
                    {!form.domain_code ? '-- Select Domain First --' : '-- Select MEP Category --'}
                  </option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.code}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Filtered dynamically by domain</p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Normalized Standard Name
                </label>
                <input
                  type="text"
                  name="normalized_name"
                  value={form.normalized_name}
                  onChange={handleChange}
                  placeholder="e.g. valve_gate_ci_flanged_pn16_100mm"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                />
                <p className="text-[10px] text-slate-500 mt-1">Canonical engineering name for matching</p>
              </div>
            </div>

            {/* Identity Attributes Editor */}
            <div className="pt-2 border-t border-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Identity Attributes</h4>
                  <p className="text-[10px] text-slate-500">
                    Define technical engineering attributes relevant to this item (stored as JSON)
                  </p>
                </div>
                {remainingAttributes.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedAttrToAdd}
                      onChange={(e) => setSelectedAttrToAdd(e.target.value)}
                      className={`text-xs rounded-lg px-2.5 py-1 border ${tInput}`}
                    >
                      <option value="">+ Add Attribute...</option>
                      {remainingAttributes.map(a => (
                        <option key={a.key} value={a.key}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {selectedAttrToAdd && (
                      <button
                        type="button"
                        onClick={() => handleAddAttribute(selectedAttrToAdd)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {displayedAttributes.map(attr => {
                  const val = identityAttributes[attr.key] || '';
                  const isCustom = !PRIMARY_ATTRIBUTE_KEYS.includes(attr.key);
                  return (
                    <div key={attr.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className={`text-[11px] font-medium truncate ${tLabel}`} title={attr.name}>
                          {attr.name}
                        </label>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.key)}
                            className="text-slate-500 hover:text-rose-400 text-[10px]"
                            title="Remove attribute"
                          >
                            remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                        placeholder={attr.placeholder}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${tInput}`}
                      />
                    </div>
                  );
                })}
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
