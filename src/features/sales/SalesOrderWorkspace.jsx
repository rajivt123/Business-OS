import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { useCrm } from '../../context/CrmContext';
import {
  ArrowLeft, Save, CheckCircle, FileText, Plus, Trash2,
  Building2, Calendar, CreditCard, Clock, ChevronDown,
  Printer, Send, AlertCircle, ShoppingBag
} from 'lucide-react';

export default function SalesOrderWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salesOrders = [], quotations = [] } = useSales();
  const { companies = [], works = [] } = useCrm();

  // Find existing order if ID provided
  const existingOrder = useMemo(() => {
    if (!id || id === 'new') return null;
    return salesOrders.find(o => o.id === id);
  }, [salesOrders, id]);

  // Form state
  const [customerId, setCustomerId] = useState(existingOrder?.company_id || (companies[0]?.id || ''));
  const [orderDate, setOrderDate] = useState(existingOrder?.order_date || new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState(existingOrder?.delivery_date || '');
  const [poReference, setPoReference] = useState(existingOrder?.po_reference || '');
  const [paymentTerms, setPaymentTerms] = useState(existingOrder?.payment_terms || '30 Days Net');
  const [notes, setNotes] = useState(existingOrder?.notes || '');
  const [status, setStatus] = useState(existingOrder?.status || 'draft');

  // Line items state
  const [lineItems, setLineItems] = useState(
    existingOrder?.items || existingOrder?.line_items || [
      { id: 1, description: 'Industrial Grade Sensor Assembly', hsn: '854231', qty: 10, unit: 'PCS', rate: 4500, discount: 5, gst: 18 },
      { id: 2, description: 'Control Panel Integration & Setup', hsn: '853710', qty: 1, unit: 'JOB', rate: 25000, discount: 0, gst: 18 },
    ]
  );

  const selectedCustomer = useMemo(() => companies.find(c => c.id === customerId), [companies, customerId]);

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let totalGst = 0;

    lineItems.forEach(item => {
      const gross = Number(item.qty || 0) * Number(item.rate || 0);
      const disc = gross * (Number(item.discount || 0) / 100);
      const taxable = gross - disc;
      const gst = taxable * (Number(item.gst || 0) / 100);

      subtotal += gross;
      totalDiscount += disc;
      taxableAmount += taxable;
      totalGst += gst;
    });

    const grandTotal = taxableAmount + totalGst;

    return { subtotal, totalDiscount, taxableAmount, totalGst, grandTotal };
  }, [lineItems]);

  const handleAddRow = () => {
    setLineItems(prev => [
      ...prev,
      { id: Date.now(), description: '', hsn: '', qty: 1, unit: 'PCS', rate: 0, discount: 0, gst: 18 }
    ]);
  };

  const handleRemoveRow = (idx) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx, field, value) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  return (
    <div className="bos-transaction-workspace" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: 'var(--bos-surface-base)',
      padding: 'var(--bos-space-6)',
      maxWidth: 1320,
      margin: '0 auto',
      width: '100%'
    }}>
      <style>{`
        .bos-transaction-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
          gap: var(--bos-space-4);
          margin-bottom: var(--bos-space-5);
        }
        .bos-transaction-footer-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
          gap: var(--bos-space-5);
          margin-top: var(--bos-space-5);
        }
        @media (max-width: 900px) {
          .bos-transaction-grid { grid-template-columns: 1fr; }
          .bos-transaction-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--bos-space-4)',
        paddingBottom: 'var(--bos-space-5)',
        borderBottom: '1px solid var(--bos-border-subtle)',
        marginBottom: 'var(--bos-space-5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-4)' }}>
          <button
            className="bos-btn bos-btn-ghost bos-btn-sm"
            onClick={() => navigate('/sales')}
            title="Back to Sales"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
            <span>Sales</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)' }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--bos-text-primary)' }}>
                {existingOrder ? (existingOrder.order_number || existingOrder.so_number || 'Sales Order') : 'New Sales Order'}
              </h1>
              <span className={`bos-badge bos-badge-${status === 'confirmed' ? 'success' : status === 'invoiced' ? 'accent' : 'neutral'}`} style={{ fontSize: 12 }}>
                {status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', marginTop: 2 }}>
              Full-page commercial sales order and billing workspace
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)' }}>
          <button
            type="button"
            className="bos-btn bos-btn-secondary bos-btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            type="button"
            className="bos-btn bos-btn-secondary bos-btn-sm"
            onClick={() => {
              setStatus('draft');
              alert('Order draft saved locally.');
            }}
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            className="bos-btn bos-btn-primary bos-btn-sm"
            onClick={() => {
              setStatus('confirmed');
              alert('Sales order confirmed successfully.');
            }}
          >
            <CheckCircle size={14} />
            <span>Confirm Order</span>
          </button>
        </div>
      </div>

      {/* Header Cards (3 columns on desktop, stacked on mobile) */}
      <div className="bos-transaction-grid">
        {/* Customer Details */}
        <div className="bos-card" style={{ padding: 'var(--bos-space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)', marginBottom: 'var(--bos-space-3)' }}>
            <Building2 size={16} style={{ color: 'var(--bos-accent)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--bos-text-secondary)' }}>
              Customer Details
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-2)' }}>
            <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500 }}>Select Client</label>
            <select
              className="bos-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{ fontSize: 13 }}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
            {selectedCustomer && (
              <div style={{ fontSize: 12, color: 'var(--bos-text-tertiary)', marginTop: 4, lineHeight: 1.5 }}>
                {selectedCustomer.gstin && <div>GSTIN: <span style={{ color: 'var(--bos-text-secondary)', fontWeight: 500 }}>{selectedCustomer.gstin}</span></div>}
                <div>{[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ') || 'No address registered'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Dates & References */}
        <div className="bos-card" style={{ padding: 'var(--bos-space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)', marginBottom: 'var(--bos-space-3)' }}>
            <Calendar size={16} style={{ color: 'var(--bos-accent)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--bos-text-secondary)' }}>
              Dates & Reference
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--bos-space-3)' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Order Date</label>
              <input
                type="date"
                className="bos-input"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Delivery By</label>
              <input
                type="date"
                className="bos-input"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Customer PO Reference</label>
              <input
                type="text"
                className="bos-input"
                placeholder="e.g. PO/2026/982"
                value={poReference}
                onChange={e => setPoReference(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        {/* Payment & Terms */}
        <div className="bos-card" style={{ padding: 'var(--bos-space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)', marginBottom: 'var(--bos-space-3)' }}>
            <CreditCard size={16} style={{ color: 'var(--bos-accent)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--bos-text-secondary)' }}>
              Commercial Terms
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-3)' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Payment Terms</label>
              <select
                className="bos-select"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="Immediate">Immediate / Advance</option>
                <option value="15 Days Net">15 Days Net</option>
                <option value="30 Days Net">30 Days Net</option>
                <option value="45 Days Net">45 Days Net</option>
                <option value="60 Days Net">60 Days Net</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--bos-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Price Basis</label>
              <div style={{ fontSize: 12, color: 'var(--bos-text-secondary)', padding: '6px 10px', background: 'var(--bos-surface-subtle)', borderRadius: 'var(--bos-radius-sm)' }}>
                Ex-Works / Inclusive of Packing & Handling
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bos-section" style={{ marginBottom: 0 }}>
        <div className="bos-section-header">
          <h2 className="bos-section-title">Line Items ({lineItems.length})</h2>
          <button
            type="button"
            className="bos-btn bos-btn-ghost bos-btn-sm"
            onClick={handleAddRow}
            style={{ fontSize: 12 }}
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
        <div className="bos-table-container" style={{ overflowX: 'auto' }}>
          <table className="bos-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th style={{ minWidth: 260 }}>Item Description</th>
                <th style={{ width: 100 }}>HSN/SAC</th>
                <th style={{ width: 90, textAlign: 'right' }}>Qty</th>
                <th style={{ width: 80 }}>Unit</th>
                <th style={{ width: 120, textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: 90, textAlign: 'right' }}>Disc %</th>
                <th style={{ width: 90, textAlign: 'right' }}>GST %</th>
                <th style={{ width: 130, textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => {
                const gross = Number(item.qty || 0) * Number(item.rate || 0);
                const disc = gross * (Number(item.discount || 0) / 100);
                const taxable = gross - disc;
                const gst = taxable * (Number(item.gst || 0) / 100);
                const total = taxable + gst;

                return (
                  <tr key={item.id || idx}>
                    <td style={{ color: 'var(--bos-text-disabled)', fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="bos-input"
                        placeholder="Item or service description"
                        value={item.description}
                        onChange={e => handleUpdateRow(idx, 'description', e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="bos-input"
                        placeholder="HSN"
                        value={item.hsn}
                        onChange={e => handleUpdateRow(idx, 'hsn', e.target.value)}
                        style={{ fontSize: 12 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="bos-input"
                        value={item.qty}
                        onChange={e => handleUpdateRow(idx, 'qty', Math.max(0, Number(e.target.value)))}
                        style={{ fontSize: 13, textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <select
                        className="bos-select"
                        value={item.unit}
                        onChange={e => handleUpdateRow(idx, 'unit', e.target.value)}
                        style={{ fontSize: 12, padding: '6px 8px' }}
                      >
                        <option value="PCS">PCS</option>
                        <option value="SET">SET</option>
                        <option value="MTR">MTR</option>
                        <option value="KGS">KGS</option>
                        <option value="JOB">JOB</option>
                        <option value="NOS">NOS</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="bos-input"
                        value={item.rate}
                        onChange={e => handleUpdateRow(idx, 'rate', Math.max(0, Number(e.target.value)))}
                        style={{ fontSize: 13, textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="bos-input"
                        value={item.discount}
                        onChange={e => handleUpdateRow(idx, 'discount', Math.min(100, Math.max(0, Number(e.target.value))))}
                        style={{ fontSize: 12, textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <select
                        className="bos-select"
                        value={item.gst}
                        onChange={e => handleUpdateRow(idx, 'gst', Number(e.target.value))}
                        style={{ fontSize: 12, textAlign: 'right' }}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--bos-text-primary)' }}>
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={lineItems.length <= 1}
                        style={{
                          background: 'none', border: 'none', padding: 4,
                          color: lineItems.length <= 1 ? 'var(--bos-text-disabled)' : 'var(--bos-error)',
                          cursor: lineItems.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Delete line"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Grid: Terms & Commercial Summary */}
      <div className="bos-transaction-footer-grid">
        {/* Notes & Terms */}
        <div className="bos-card" style={{ padding: 'var(--bos-space-4)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bos-text-primary)', marginBottom: 'var(--bos-space-2)' }}>
            Special Instructions & Terms
          </h3>
          <textarea
            className="bos-input"
            rows="5"
            placeholder="Specify any special packaging, dispatch instructions, or commercial conditions..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ fontSize: 13, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bos-space-2)', marginTop: 'var(--bos-space-3)', color: 'var(--bos-text-tertiary)', fontSize: 12 }}>
            <AlertCircle size={14} />
            <span>Tax invoice will automatically reflect these terms upon order fulfillment.</span>
          </div>
        </div>

        {/* Commercial Totals Pane */}
        <div className="bos-card" style={{ padding: 'var(--bos-space-5)', background: 'var(--bos-surface-subtle)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bos-text-primary)', marginBottom: 'var(--bos-space-3)' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bos-space-2)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bos-text-secondary)' }}>
              <span>Gross Total</span>
              <span>₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {calculations.totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bos-success)' }}>
                <span>Total Discount</span>
                <span>-₹{calculations.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bos-text-secondary)' }}>
              <span>Taxable Amount</span>
              <span>₹{calculations.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bos-text-secondary)' }}>
              <span>GST (Estimated)</span>
              <span>₹{calculations.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 'var(--bos-space-3)',
              marginTop: 'var(--bos-space-2)',
              borderTop: '2px solid var(--bos-border-subtle)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--bos-text-primary)'
            }}>
              <span>Net Payable</span>
              <span style={{ color: 'var(--bos-accent)' }}>
                ₹{calculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
