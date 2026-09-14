import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Truck, AlertTriangle, CheckCircle2, Info, Layers, ShieldAlert } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function IssueReservationModal({ isOpen, onClose, reservation, isDarkMode }) {
  const { issueInventoryAgainstReservation, getCurrentStock, submitting } = useInventory();

  const [lineIssueQuantities, setLineIssueQuantities] = useState({});
  const [selectedLocationIdFilter, setSelectedLocationIdFilter] = useState('ALL');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Extract unique locations present in the reservation lines
  const uniqueLocations = useMemo(() => {
    if (!reservation?.lines) return [];
    const locMap = new Map();
    reservation.lines.forEach(l => {
      const locId = l.location_id || l.location?.id;
      if (locId && !locMap.has(locId)) {
        locMap.set(locId, l.location || { id: locId, code: 'Warehouse' });
      }
    });
    return Array.from(locMap.values());
  }, [reservation]);

  useEffect(() => {
    if (isOpen && reservation) {
      setReferenceNo(`ISS-${Date.now().toString().slice(-6)}`);
      setNotes('');
      setErrorMsg('');
      setSuccessInfo(null);
      setSelectedLocationIdFilter('ALL');

      const initQty = {};
      (reservation.lines || []).forEach(l => {
        const resQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
        const relQty = Number(l.released_quantity) || 0;
        const issQty = Number(l.issued_quantity) || 0;
        const remQty = Math.max(0, resQty - relQty - issQty);
        initQty[l.id] = String(remQty);
      });
      setLineIssueQuantities(initQty);
    }
  }, [isOpen, reservation]);

  if (!isOpen || !reservation) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleQtyChange = (lineId, value) => {
    setLineIssueQuantities(prev => ({
      ...prev,
      [lineId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo(null);

    const linesPayload = [];
    const lines = reservation.lines || [];
    let issueLocationId = null;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const lineLocId = l.location_id || l.location?.id;

      // Filter by location if filter active
      if (selectedLocationIdFilter !== 'ALL' && lineLocId !== selectedLocationIdFilter) {
        continue;
      }

      const resQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
      const relQty = Number(l.released_quantity) || 0;
      const issQty = Number(l.issued_quantity) || 0;
      const remQty = Math.max(0, resQty - relQty - issQty);

      const qtyToIssue = Number(lineIssueQuantities[l.id]);

      if (isNaN(qtyToIssue) || qtyToIssue < 0) {
        setErrorMsg(`Please enter a valid issue quantity for line #${i + 1}`);
        return;
      }

      if (qtyToIssue > remQty) {
        setErrorMsg(`Line #${i + 1} issue quantity (${qtyToIssue}) cannot exceed remaining reserved quantity (${remQty})`);
        return;
      }

      if (qtyToIssue > 0) {
        // Enforce single source location rule for batch transaction
        if (!issueLocationId) {
          issueLocationId = lineLocId;
        } else if (lineLocId && lineLocId !== issueLocationId) {
          setErrorMsg('All issue lines in a single transaction must belong to the same stock location. Please select a single stock location filter.');
          return;
        }

        linesPayload.push({
          reservation_line_id: l.id,
          quantity: qtyToIssue,
          notes: notes
        });
      }
    }

    if (linesPayload.length === 0) {
      setErrorMsg('Please specify a positive quantity to issue for at least one line');
      return;
    }

    const payload = {
      reservation_id: reservation.id,
      transaction_date: new Date().toISOString(),
      reference_no: referenceNo || `ISS-${Date.now().toString().slice(-6)}`,
      notes: notes,
      idempotency_key: crypto.randomUUID(),
      lines: linesPayload
    };

    const res = await issueInventoryAgainstReservation(payload);
    if (res.success) {
      setSuccessInfo(res.data || { transaction_no: referenceNo, status: 'FULFILLED' });
    } else {
      setErrorMsg(res.error || 'Failed to issue inventory against reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[850px] w-full max-h-[92vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue / Dispatch Physical Stock</h2>
              <p className="text-xs text-slate-500">
                Reservation #{reservation.reservation_number || reservation.code || reservation.id?.slice(0, 8)} • SO: {reservation.sales_order?.sales_order_number || reservation.sales_order?.order_number || 'SO'}
              </p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {successInfo ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Stock Issue Transaction Complete!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Physical stock has been deducted from the warehouse and recorded against the reservation.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-left max-w-sm mx-auto space-y-1.5 shadow-inner">
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>Tx Number:</span>
                  <span>{successInfo.transaction_no || successInfo.transaction_number || successInfo.reference_no || 'Posted'}</span>
                </div>
                {successInfo.transaction_id && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Tx ID:</span>
                    <span className="font-mono text-slate-300">{successInfo.transaction_id.slice(0, 18)}...</span>
                  </div>
                )}
                {successInfo.status && (
                  <div className="flex justify-between items-center text-sky-400 text-[11px] font-bold uppercase">
                    <span>Status:</span>
                    <span>{successInfo.status}</span>
                  </div>
                )}
                {successInfo.idempotent_replay && (
                  <div className="text-amber-400 text-[10px] italic pt-1 border-t border-slate-800 text-center">
                    Request replayed via Idempotency Key
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form id="issue-form" onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* CRITICAL WARNING BANNER */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-1">
                    AUTHORITATIVE STOCK DEDUCTION NOTICE
                  </h4>
                  <p>
                    <strong>Physical stock on hand will decrease by the issued quantity upon confirmation.</strong> This action posts a physical stock movement transaction and updates fulfilment progress against the Sales Order.
                  </p>
                </div>
              </div>

              {/* Reference & Notes */}
              <div className={`p-4 rounded-xl border ${tSection} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Dispatch / Issue Reference No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. DISP-2026-001"
                    className={`w-full rounded-lg px-3 py-2 text-sm border font-mono font-bold ${tInput}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                    Issue / Delivery Remarks
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Delivered via Truck #KA-05-1234"
                    className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className={`p-4 rounded-xl border space-y-3 ${tSection}`}>
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Allocation Lines & Issue Quantities
                  </h3>

                  {uniqueLocations.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">Filter Location:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLocationIdFilter('ALL')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedLocationIdFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        All
                      </button>
                      {uniqueLocations.map(loc => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setSelectedLocationIdFilter(loc.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            selectedLocationIdFilter === loc.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {loc.code || 'Loc'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                  <table className="w-full text-left text-xs">
                    <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700 font-semibold'}>
                      <tr>
                        <th className="p-3">Item & Location</th>
                        <th className="p-3 text-right">Physical QOH</th>
                        <th className="p-3 text-right">Reserved</th>
                        <th className="p-3 text-right">Issued</th>
                        <th className="p-3 text-right text-emerald-400">Available to Issue</th>
                        <th className="p-3 text-right w-[150px]">Issue Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(reservation.lines || [])
                        .filter(l => {
                          const locId = l.location_id || l.location?.id;
                          return selectedLocationIdFilter === 'ALL' || locId === selectedLocationIdFilter;
                        })
                        .map((l, idx) => {
                          const itemId = l.inventory_item_id || l.item_id || l.item?.id;
                        const locId = l.location_id || l.location?.id;
                        const lotNum = l.lot_number || '';

                        const physicalStock = getCurrentStock(itemId, locId, lotNum);
                        const resQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
                        const relQty = Number(l.released_quantity) || 0;
                        const issQty = Number(l.issued_quantity) || 0;
                        const remQty = Math.max(0, resQty - relQty - issQty);

                        return (
                          <tr key={l.id || idx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                            <td className="p-3 font-medium">
                              <p className="font-semibold text-slate-100">{l.item?.name || 'Inventory Item'}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {l.location?.code ? `${l.location.code} (${l.location.name})` : 'Location'}
                                {lotNum ? ` • Lot: ${lotNum}` : ''}
                              </p>
                            </td>

                            <td className="p-3 text-right font-mono font-semibold text-slate-300">{physicalStock}</td>
                            <td className="p-3 text-right font-mono text-amber-400 font-bold">{resQty}</td>
                            <td className="p-3 text-right font-mono text-blue-400">{issQty}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">{remQty}</td>

                            <td className="p-3 text-right font-mono">
                              <input
                                type="number"
                                value={lineIssueQuantities[l.id] || ''}
                                onChange={(e) => handleQtyChange(l.id, e.target.value)}
                                min="0"
                                max={remQty}
                                step="any"
                                disabled={remQty === 0}
                                className={`w-full text-right rounded-lg px-2 py-1 text-xs border font-mono font-bold ${
                                  Number(lineIssueQuantities[l.id]) > remQty ? 'border-rose-500 text-rose-500' : tInput
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Partial Issue Support:</strong> You can issue a partial quantity now. The remaining unissued reservation quantity will stay active for future dispatches until fulfilled or released.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!successInfo && (
          <div className={`px-6 py-4 border-t flex justify-between items-center shrink-0 ${tHeader}`}>
            <div className="text-xs text-slate-400 font-medium">
              Action: <span className="text-emerald-400 font-semibold">Post Physical Stock Issue</span>
            </div>
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
                form="issue-form"
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Issue...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" /> Confirm & Issue Stock
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
