import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, ArrowRightLeft, MapPin, Package, DollarSign, Calendar, FileText, Plus, Trash2, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

const TRANSACTION_TYPES = [
  { id: 'RECEIPT', name: 'Stock Receipt', requiresSource: false, requiresDest: true, requiresCost: true },
  { id: 'ISSUE', name: 'Stock Issue', requiresSource: true, requiresDest: false, requiresCost: false },
  { id: 'TRANSFER', name: 'Stock Transfer', requiresSource: true, requiresDest: true, requiresCost: false },
  { id: 'OPENING', name: 'Opening Stock', requiresSource: false, requiresDest: true, requiresCost: true },
  { id: 'ADJUSTMENT_IN', name: 'Adjustment In', requiresSource: false, requiresDest: true, requiresCost: true },
  { id: 'ADJUSTMENT_OUT', name: 'Adjustment Out', requiresSource: true, requiresDest: false, requiresCost: false },
  { id: 'RETURN_IN', name: 'Return In', requiresSource: false, requiresDest: true, requiresCost: true },
  { id: 'RETURN_OUT', name: 'Return Out', requiresSource: true, requiresDest: false, requiresCost: false },
  { id: 'CONSUMPTION', name: 'Material Consumption', requiresSource: true, requiresDest: false, requiresCost: false, supportsWork: true }
];

export default function StockTransactionModal({ isOpen, onClose, isDarkMode, initialType = 'RECEIPT' }) {
  const { items, locations, getCurrentStock, postTransaction, submitting, works = [] } = useInventory();

  const [transactionType, setTransactionType] = useState(initialType);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [workId, setWorkId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Transaction Lines State
  const [lines, setLines] = useState([
    { item_id: '', quantity: '1', unit_cost: '0', lot_number: '', notes: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      setTransactionType(initialType);
      setTransactionDate(new Date().toISOString().slice(0, 16));
      setFromLocationId('');
      setToLocationId('');
      setReferenceNo('');
      setWorkId('');
      setNotes('');
      setErrorMsg('');
      setLines([{ item_id: '', quantity: '1', unit_cost: '0', lot_number: '', notes: '' }]);
    }
  }, [isOpen, initialType]);

  const typeConfig = useMemo(() => {
    return TRANSACTION_TYPES.find(t => t.id === transactionType) || TRANSACTION_TYPES[0];
  }, [transactionType]);

  if (!isOpen) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleLineChange = (index, field, value) => {
    setLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLine = () => {
    setLines(prev => [...prev, { item_id: '', quantity: '1', unit_cost: '0', lot_number: '', notes: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation Rules
    if (typeConfig.requiresSource && !fromLocationId) {
      setErrorMsg(`Source location is required for ${typeConfig.name}`);
      return;
    }
    if (typeConfig.requiresDest && !toLocationId) {
      setErrorMsg(`Destination location is required for ${typeConfig.name}`);
      return;
    }
    if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
      setErrorMsg('Source and Destination locations cannot be the same');
      return;
    }

    if (lines.length === 0) {
      setErrorMsg('At least one item line is required');
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.item_id) {
        setErrorMsg(`Item is required on line #${i + 1}`);
        return;
      }
      const qty = Number(l.quantity);
      if (isNaN(qty) || qty <= 0) {
        setErrorMsg(`Quantity must be greater than zero on line #${i + 1}`);
        return;
      }
      if (typeConfig.requiresCost) {
        const cost = Number(l.unit_cost);
        if (isNaN(cost) || cost < 0) {
          setErrorMsg(`Unit cost must be a valid non-negative number on line #${i + 1}`);
          return;
        }
      }
    }

    const payload = {
      transaction_type: transactionType,
      transaction_date: new Date(transactionDate).toISOString(),
      from_location_id: fromLocationId || null,
      to_location_id: toLocationId || null,
      reference_no: referenceNo,
      work_id: workId || null,
      notes: notes,
      lines: lines.map(l => ({
        item_id: l.item_id,
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost) || 0,
        lot_number: (l.lot_number || '').trim(),
        notes: l.notes
      }))
    };

    const res = await postTransaction(payload);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to post stock transaction');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[1000px] w-full max-h-[92vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Inventory Transaction</h2>
              <p className="text-xs text-slate-500">Post authoritative stock movement or adjustment</p>
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
        <form id="stock-tx-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Header Controls Grid */}
          <div className={`p-4 rounded-xl border ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Transaction Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Transaction Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-semibold ${tInput}`}
                >
                  {TRANSACTION_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Transaction Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Reference / Document No.
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. PO-98012 / GRN-441 / WO-102"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                />
              </div>

              {/* Source Location */}
              {typeConfig.requiresSource && (
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Source Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={fromLocationId}
                    onChange={(e) => setFromLocationId(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                    required
                  >
                    <option value="">-- Select Source Location --</option>
                    {locations.filter(l => l.is_stock_location).map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.code} - {loc.name} ({loc.location_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destination Location */}
              {typeConfig.requiresDest && (
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Destination Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={toLocationId}
                    onChange={(e) => setToLocationId(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                    required
                  >
                    <option value="">-- Select Destination Location --</option>
                    {locations.filter(l => l.is_stock_location).map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.code} - {loc.name} ({loc.location_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Project/Work link */}
              {typeConfig.supportsWork && (
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Project / Work (Optional)
                  </label>
                  <select
                    value={workId}
                    onChange={(e) => setWorkId(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  >
                    <option value="">-- Select Project / Work --</option>
                    {works.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.wo_number || w.po_number || 'Project'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={typeConfig.requiresSource && typeConfig.requiresDest ? "md:col-span-3" : "md:col-span-2"}>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for movement or adjustment..."
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className={`p-4 rounded-xl border ${tSection}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Package className="w-4 h-4" /> Material Line Items
              </h3>
              <button
                type="button"
                onClick={addLine}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700 font-semibold'}>
                  <tr>
                    <th className="p-3 w-[260px]">Item Master</th>
                    {typeConfig.requiresSource && <th className="p-3 w-[120px]">Available Stock</th>}
                    <th className="p-3 w-[120px]">Quantity</th>
                    {typeConfig.requiresCost && <th className="p-3 w-[130px]">Unit Cost (₹)</th>}
                    <th className="p-3 w-[130px]">Lot / Batch No.</th>
                    <th className="p-3">Line Notes</th>
                    <th className="p-3 w-[45px] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lines.map((line, idx) => {
                    const selectedItem = items.find(i => i.id === line.item_id);
                    const currentStock = fromLocationId && line.item_id
                      ? getCurrentStock(line.item_id, fromLocationId, line.lot_number)
                      : 0;

                    const isOverIssue = typeConfig.requiresSource && Number(line.quantity) > currentStock;

                    return (
                      <tr key={idx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="p-3">
                          <select
                            value={line.item_id}
                            onChange={(e) => handleLineChange(idx, 'item_id', e.target.value)}
                            className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${tInput}`}
                            required
                          >
                            <option value="">-- Select Item --</option>
                            {items.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.item_code} - {item.name} ({item.base_uom_code})
                              </option>
                            ))}
                          </select>
                        </td>

                        {typeConfig.requiresSource && (
                          <td className="p-3 font-mono font-semibold">
                            {line.item_id && fromLocationId ? (
                              <span className={currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {currentStock} {selectedItem?.base_uom_code || ''}
                              </span>
                            ) : (
                              <span className="text-slate-500">--</span>
                            )}
                          </td>
                        )}

                        <td className="p-3">
                          <input
                            type="number"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                            min="0.0001"
                            step="any"
                            placeholder="Qty"
                            className={`w-full rounded-lg px-2.5 py-1.5 text-xs border font-mono ${isOverIssue ? 'border-rose-500 text-rose-500 bg-rose-500/10' : tInput}`}
                            required
                          />
                          {isOverIssue && (
                            <span className="text-[10px] text-rose-500 font-semibold block mt-1">Exceeds Stock!</span>
                          )}
                        </td>

                        {typeConfig.requiresCost && (
                          <td className="p-3">
                            <input
                              type="number"
                              value={line.unit_cost}
                              onChange={(e) => handleLineChange(idx, 'unit_cost', e.target.value)}
                              min="0"
                              step="any"
                              placeholder="Unit Cost"
                              className={`w-full rounded-lg px-2.5 py-1.5 text-xs border font-mono ${tInput}`}
                            />
                          </td>
                        )}

                        <td className="p-3">
                          <input
                            type="text"
                            value={line.lot_number || ''}
                            onChange={(e) => handleLineChange(idx, 'lot_number', e.target.value)}
                            placeholder="Batch/Lot #"
                            className={`w-full rounded-lg px-2.5 py-1.5 text-xs border font-mono ${tInput}`}
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={line.notes}
                            onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                            placeholder="Line remarks"
                            className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${tInput}`}
                          />
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            disabled={lines.length <= 1}
                            className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            form="stock-tx-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Posting Transaction...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Post Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
