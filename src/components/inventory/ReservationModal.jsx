import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, BookmarkCheck, ShoppingCart, Package, MapPin, AlertTriangle, CheckCircle2, Info, Layers } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';

export default function ReservationModal({ isOpen, onClose, isDarkMode }) {
  const { items, locations, getCurrentStock, getReservedStock, getAvailableStock, createReservation, submitting } = useInventory();
  const salesContext = useSales() || {};
  const salesOrders = salesContext.salesOrders || [];

  const [selectedSoId, setSelectedSoId] = useState('');
  const [selectedSoItemId, setSelectedSoItemId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [reservationQty, setReservationQty] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Sales Order object
  const selectedSo = useMemo(() => {
    return salesOrders.find(so => so.id === selectedSoId) || null;
  }, [salesOrders, selectedSoId]);

  // Selected Sales Order Item object
  const selectedSoItem = useMemo(() => {
    if (!selectedSo || !selectedSo.items) return null;
    return selectedSo.items.find(item => item.id === selectedSoItemId) || null;
  }, [selectedSo, selectedSoItemId]);

  // Available stock locations
  const stockLocations = useMemo(() => {
    return locations.filter(l => l.is_stock_location && l.is_active !== false);
  }, [locations]);

  // Real-time stock math
  const physicalStock = useMemo(() => {
    if (!selectedItemId || !selectedLocationId) return 0;
    return getCurrentStock(selectedItemId, selectedLocationId, lotNumber);
  }, [selectedItemId, selectedLocationId, lotNumber, getCurrentStock]);

  const alreadyReserved = useMemo(() => {
    if (!selectedItemId || !selectedLocationId) return 0;
    return getReservedStock(selectedItemId, selectedLocationId, lotNumber);
  }, [selectedItemId, selectedLocationId, lotNumber, getReservedStock]);

  const availableToReserve = useMemo(() => {
    if (!selectedItemId || !selectedLocationId) return 0;
    return getAvailableStock(selectedItemId, selectedLocationId, lotNumber);
  }, [selectedItemId, selectedLocationId, lotNumber, getAvailableStock]);

  const requestedQty = Number(selectedSoItem?.quantity) || 0;

  // Auto-set initial reservation quantity when Sales Order Item or Available changes
  useEffect(() => {
    if (selectedSoItem && availableToReserve > 0) {
      const defaultQty = Math.min(Number(selectedSoItem.quantity) || 0, availableToReserve);
      setReservationQty(String(defaultQty > 0 ? defaultQty : ''));
    }
  }, [selectedSoItem, availableToReserve]);

  // Auto-suggest matching Inventory Item if item_code or description matches
  useEffect(() => {
    if (selectedSoItem && !selectedItemId) {
      const match = items.find(i => 
        (i.item_code && selectedSoItem.item_code && i.item_code.toLowerCase() === selectedSoItem.item_code.toLowerCase()) ||
        (i.name && selectedSoItem.item_description && i.name.toLowerCase().includes(selectedSoItem.item_description.toLowerCase()))
      );
      if (match) setSelectedItemId(match.id);
    }
  }, [selectedSoItem, items, selectedItemId]);

  if (!isOpen) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSoId) {
      setErrorMsg('Please select a Sales Order');
      return;
    }
    if (!selectedSoItemId) {
      setErrorMsg('Please select a Sales Order Line Item');
      return;
    }
    if (!selectedItemId) {
      setErrorMsg('Please select an Inventory Item');
      return;
    }
    if (!selectedLocationId) {
      setErrorMsg('Please select a Stock Location');
      return;
    }

    const qtyToReserve = Number(reservationQty);
    if (isNaN(qtyToReserve) || qtyToReserve <= 0) {
      setErrorMsg('Reservation quantity must be greater than zero');
      return;
    }

    if (qtyToReserve > availableToReserve) {
      setErrorMsg(`Cannot reserve ${qtyToReserve}. Maximum available to reserve is ${availableToReserve}.`);
      return;
    }

    const payload = {
      sales_order_id: selectedSoId,
      notes: notes,
      lines: [
        {
          sales_order_item_id: selectedSoItemId,
          inventory_item_id: selectedItemId,
          location_id: selectedLocationId,
          lot_number: lotNumber,
          quantity: qtyToReserve
        }
      ]
    };

    const res = await createReservation(payload);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create inventory reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[900px] w-full max-h-[92vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Inventory Stock Reservation</h2>
              <p className="text-xs text-slate-500">Allocate available stock to a Sales Order without reducing physical stock on hand</p>
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
        <form id="reservation-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Sales Order Selection */}
          <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> 1. Sales Order & Commercial Line Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Sales Order <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSoId}
                  onChange={(e) => {
                    setSelectedSoId(e.target.value);
                    setSelectedSoItemId('');
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-semibold ${tInput}`}
                  required
                >
                  <option value="">-- Select Sales Order --</option>
                  {salesOrders.map(so => (
                    <option key={so.id} value={so.id}>
                      {so.sales_order_number || so.order_number || 'SO'} - {so.company?.name || so.customer_name || 'Customer'} ({so.status || 'Active'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Sales Order Line Item <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSoItemId}
                  onChange={(e) => setSelectedSoItemId(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  disabled={!selectedSoId}
                  required
                >
                  <option value="">-- Select Order Line Item --</option>
                  {(selectedSo?.items || []).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.item_description || 'Line Item'} - Qty: {item.quantity} (₹{item.unit_price || 0}/unit)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSoItem && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-400">Selected SO Line: </span>
                  <span>{selectedSoItem.item_description}</span>
                </div>
                <div className="font-mono font-bold">
                  Requested Order Qty: <span className="text-amber-400">{selectedSoItem.quantity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Inventory Mapping & Location */}
          <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Package className="w-4 h-4" /> 2. Inventory Item & Stock Location Mapping
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Inventory Master Item <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                >
                  <option value="">-- Select Inventory Item --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.item_code} - {item.name} ({item.base_uom_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Stock Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                >
                  <option value="">-- Select Warehouse / Location --</option>
                  {stockLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.code} - {loc.name} ({loc.location_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Batch / Lot Number (Optional)
                </label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="e.g. LOT-2026-09"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stock Availability & Reservation Allocation */}
          {selectedItemId && selectedLocationId && (
            <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Layers className="w-4 h-4" /> 3. Real-Time Stock Availability & Allocation
              </h3>

              {/* Stock KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/40">
                  <p className="text-[11px] text-slate-400 font-medium">Physical Stock On Hand</p>
                  <p className="text-lg font-bold font-mono text-slate-100 mt-1">{physicalStock}</p>
                </div>

                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <p className="text-[11px] text-amber-400 font-medium">Already Reserved</p>
                  <p className="text-lg font-bold font-mono text-amber-400 mt-1">{alreadyReserved}</p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-[11px] text-emerald-400 font-medium">Available to Reserve</p>
                  <p className="text-lg font-bold font-mono text-emerald-400 mt-1">{availableToReserve}</p>
                </div>

                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                  <p className="text-[11px] text-blue-400 font-medium">Requested SO Line Qty</p>
                  <p className="text-lg font-bold font-mono text-blue-400 mt-1">{requestedQty || '--'}</p>
                </div>
              </div>

              {/* Reservation Input Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    New Reservation Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={reservationQty}
                    onChange={(e) => setReservationQty(e.target.value)}
                    min="0.0001"
                    max={availableToReserve}
                    step="any"
                    placeholder="Enter quantity to reserve"
                    className={`w-full rounded-lg px-3 py-2 text-sm border font-mono font-bold ${
                      Number(reservationQty) > availableToReserve ? 'border-rose-500 text-rose-500 bg-rose-500/10' : tInput
                    }`}
                    required
                  />
                  {availableToReserve === 0 ? (
                    <span className="text-[11px] text-rose-400 font-semibold block mt-1">
                      No available stock remaining to reserve at this location.
                    </span>
                  ) : requestedQty > availableToReserve ? (
                    <span className="text-[11px] font-medium text-amber-400 block mt-1">
                      Partial Reservation: Stock available ({availableToReserve}) is less than SO requested qty ({requestedQty}).
                    </span>
                  ) : null}
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Reservation Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Allocated for site dispatch batch #1"
                    className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  />
                </div>
              </div>

              {/* Important Physical Stock Policy Disclaimer */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Reservation Rule:</strong> Creating a stock reservation updates the <em>Available Stock</em> balance. 
                  Physical stock on hand ({physicalStock}) remains completely unchanged until actual material issue or dispatch occurs.
                </span>
              </div>
            </div>
          )}
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
            form="reservation-form"
            disabled={submitting || availableToReserve === 0}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Reserving Stock...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Create Reservation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
