import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Info, Layers } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function ReleaseReservationModal({ isOpen, onClose, reservation, isDarkMode }) {
  const { releaseReservation, submitting } = useInventory();

  const [releaseType, setReleaseType] = useState('FULL'); // 'FULL' | 'PARTIAL'
  const [lineReleaseQuantities, setLineReleaseQuantities] = useState({});
  const [releaseReason, setReleaseReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && reservation) {
      setReleaseType('FULL');
      setReleaseReason('');
      setErrorMsg('');

      const initQty = {};
      (reservation.lines || []).forEach(l => {
        const reqQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
        const relQty = Number(l.released_quantity) || 0;
        const remQty = Math.max(0, reqQty - relQty);
        initQty[l.id] = String(remQty);
      });
      setLineReleaseQuantities(initQty);
    }
  }, [isOpen, reservation]);

  if (!isOpen || !reservation) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleQtyChange = (lineId, value) => {
    setLineReleaseQuantities(prev => ({
      ...prev,
      [lineId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const linesPayload = [];
    const lines = reservation.lines || [];

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const reqQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
      const relQty = Number(l.released_quantity) || 0;
      const remQty = Math.max(0, reqQty - relQty);

      let qtyToRelease = 0;
      if (releaseType === 'FULL') {
        qtyToRelease = remQty;
      } else {
        qtyToRelease = Number(lineReleaseQuantities[l.id]);
        if (isNaN(qtyToRelease) || qtyToRelease < 0) {
          setErrorMsg(`Please enter a valid release quantity for line #${i + 1}`);
          return;
        }
        if (qtyToRelease > remQty) {
          setErrorMsg(`Line #${i + 1} release quantity (${qtyToRelease}) cannot exceed remaining reserved quantity (${remQty})`);
          return;
        }
      }

      if (qtyToRelease > 0) {
        linesPayload.push({
          reservation_line_id: l.id,
          quantity: qtyToRelease
        });
      }
    }

    if (linesPayload.length === 0) {
      setErrorMsg('No reserved quantity selected to release');
      return;
    }

    const payload = {
      reservation_id: reservation.id,
      release_reason: releaseReason || 'User release',
      notes: releaseReason,
      lines: linesPayload
    };

    const res = await releaseReservation(payload);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to release reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[800px] w-full max-h-[90vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Release Inventory Reservation</h2>
              <p className="text-xs text-slate-500">
                Reservation #{reservation.reservation_number || reservation.code || reservation.id?.slice(0, 8)}
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

        {/* Scrollable Form Body */}
        <form id="release-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reservation Header Card */}
          <div className={`p-4 rounded-xl border ${tSection} space-y-2`}>
            <div className="flex flex-wrap justify-between items-center text-xs">
              <div>
                <span className="font-bold text-amber-500">Sales Order: </span>
                <span className="font-mono">{reservation.sales_order?.sales_order_number || reservation.sales_order?.order_number || 'SO'}</span>
                <span className="ml-2 text-slate-400">({reservation.sales_order?.customer_name || 'Customer'})</span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  reservation.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {(reservation.status || 'ACTIVE').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Release Mode Selector */}
          <div className={`p-4 rounded-xl border space-y-3 ${tSection}`}>
            <label className={`block text-xs font-bold uppercase tracking-wider ${tLabel}`}>
              Release Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="releaseType"
                  value="FULL"
                  checked={releaseType === 'FULL'}
                  onChange={() => setReleaseType('FULL')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span>Full Release (Release 100% of remaining reserved qty)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="releaseType"
                  value="PARTIAL"
                  checked={releaseType === 'PARTIAL'}
                  onChange={() => setReleaseType('PARTIAL')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span>Partial Release (Specify exact quantity to release)</span>
              </label>
            </div>
          </div>

          {/* Lines Table */}
          <div className={`p-4 rounded-xl border space-y-3 ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Reserved Line Items
            </h3>

            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-left text-xs">
                <thead className={isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700 font-semibold'}>
                  <tr>
                    <th className="p-3">Inventory Item & Location</th>
                    <th className="p-3 text-right">Reserved Qty</th>
                    <th className="p-3 text-right">Already Released</th>
                    <th className="p-3 text-right">Remaining Reserved</th>
                    <th className="p-3 text-right w-[150px]">Qty to Release</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(reservation.lines || []).map((l, idx) => {
                    const reqQty = Number(l.reserved_quantity) || Number(l.quantity) || 0;
                    const relQty = Number(l.released_quantity) || 0;
                    const remQty = Math.max(0, reqQty - relQty);

                    return (
                      <tr key={l.id || idx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-medium">
                          <p className="font-semibold text-slate-100">{l.item?.name || 'Inventory Item'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {l.location?.code ? `${l.location.code} (${l.location.name})` : 'Location'}
                            {l.lot_number ? ` • Lot: ${l.lot_number}` : ''}
                          </p>
                        </td>

                        <td className="p-3 text-right font-mono font-bold">{reqQty}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{relQty}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400">{remQty}</td>

                        <td className="p-3 text-right font-mono">
                          {releaseType === 'FULL' ? (
                            <span className="font-bold text-rose-400">{remQty}</span>
                          ) : (
                            <input
                              type="number"
                              value={lineReleaseQuantities[l.id] || ''}
                              onChange={(e) => handleQtyChange(l.id, e.target.value)}
                              min="0"
                              max={remQty}
                              step="any"
                              disabled={remQty === 0}
                              className={`w-full text-right rounded-lg px-2 py-1 text-xs border font-mono font-bold ${tInput}`}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Release Reason Field */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
              Release Reason / Notes
            </label>
            <input
              type="text"
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
              placeholder="e.g. Sales order cancelled, quantity reduced, or alternative stock assigned"
              className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Effect of Release:</strong> Releasing reserved stock frees the material back into <em>Available Stock</em> for allocation to other Sales Orders. Physical stock on hand remains unchanged.
            </span>
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
            form="release-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Releasing Reservation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Confirm Release
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
