import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCustomers, createCustomer } from '../api/customers';
import { getProducts } from '../api/products';
import { getTerms } from '../api/terms';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

/**
 * Reusable document form for Quotations, Invoices, POs, Receipts.
 *
 * Props:
 *  - docType: 'quotation'|'invoice'|'purchase_order'|'receipt'
 *  - docLabel: display name
 *  - onSubmit(data): async handler
 *  - extraFields: optional render prop for type-specific fields
 */
export default function DocumentForm({ docType, docLabel, onSubmit, extraFields }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [terms, setTerms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Customer selection
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustMode, setNewCustMode] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', company_name: '', email: '', mobile: '' });

  // Line items
  const [lineItems, setLineItems] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Form
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    valid_until: '',
    expected_date: '',
    other_charges: 0,
    other_charges_taxable: false,
    notes: '',
    terms_content: '',
    paid_amount: 0,
    paid_date: '',
    payment_notes: '',
    payment_method: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes, termRes] = await Promise.all([
        getCustomers(),
        getProducts(),
        getTerms(docType === 'purchase_order' ? 'purchase_order' : docType),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setTerms(termRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.gst_percent / 100), 0);
  const otherCharges = Number(form.other_charges) || 0;
  const total = subtotal + taxAmount + otherCharges;

  const addProduct = (prod) => {
    setLineItems([
      ...lineItems,
      {
        product_id: prod.id,
        product_name: prod.product_name,
        quantity: 1,
        unit_price: Number(prod.price),
        unit: prod.unit,
        gst_percent: Number(prod.gst_percent),
        hsn_code: prod.hsn_code || '',
      },
    ]);
    setProductModalOpen(false);
  };

  const addBlankItem = () => {
    setLineItems([
      ...lineItems,
      { product_id: null, product_name: '', quantity: 1, unit_price: 0, unit: 'PCS', gst_percent: 0, hsn_code: '' },
    ]);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerModalOpen(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCust.name.trim()) return setToast({ type: 'error', message: 'Customer name required' });
    try {
      const res = await createCustomer(newCust);
      setSelectedCustomer(res.data);
      setCustomers([...customers, res.data]);
      setCustomerModalOpen(false);
      setNewCustMode(false);
      setToast({ type: 'success', message: 'Customer created' });
    } catch {
      setToast({ type: 'error', message: 'Failed to create customer' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return setToast({ type: 'error', message: 'Please select a customer' });
    if (lineItems.length === 0) return setToast({ type: 'error', message: 'Add at least one item' });
    for (const item of lineItems) {
      if (!item.product_name.trim()) return setToast({ type: 'error', message: 'All items must have a name' });
    }

    const data = {
      customer_id: selectedCustomer.id,
      date: form.date,
      other_charges: otherCharges,
      other_charges_taxable: form.other_charges_taxable,
      notes: form.notes || null,
      terms_content: form.terms_content || null,
      line_items: lineItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        unit: item.unit,
        gst_percent: Number(item.gst_percent),
        hsn_code: item.hsn_code || null,
      })),
    };

    // Type-specific fields
    if (docType === 'quotation') data.valid_until = form.valid_until || null;
    if (docType === 'invoice') {
      data.due_date = form.due_date || null;
      data.paid_amount = Number(form.paid_amount) || 0;
      data.paid_date = form.paid_date || null;
      data.payment_notes = form.payment_notes || null;
    }
    if (docType === 'purchase_order') data.expected_date = form.expected_date || null;
    if (docType === 'receipt') data.payment_method = form.payment_method || null;

    setSaving(true);
    try {
      await onSubmit(data);
      setToast({ type: 'success', message: `${docLabel} created!` });
      const listPath = docType === 'purchase_order' ? '/purchase-orders' : `/${docType}s`;
      setTimeout(() => navigate(listPath), 1000);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || `Failed to create ${docLabel}` });
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.company_name && c.company_name.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  return (
    <div className="page-container max-w-5xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">New {docLabel}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold gradient-text">Customer</h3>
              <button type="button" className="btn-secondary btn-sm" onClick={() => { setCustomerModalOpen(true); setNewCustMode(false); setCustomerSearch(''); }}>
                {selectedCustomer ? 'Change' : 'Select Customer'}
              </button>
            </div>
            {selectedCustomer ? (
              <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="font-semibold text-lg">{selectedCustomer.name}</div>
                {selectedCustomer.company_name && <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selectedCustomer.company_name}</div>}
                <div className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
                  {[selectedCustomer.email, selectedCustomer.mobile].filter(Boolean).join(' • ')}
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>No customer selected. Click "Select Customer" to choose one.</p>
            )}
          </div>

          {/* Date & Details */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold gradient-text mb-4">Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              {docType === 'invoice' && (
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              )}
              {docType === 'quotation' && (
                <div>
                  <label className="form-label">Valid Until</label>
                  <input type="date" className="form-input" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              )}
              {docType === 'purchase_order' && (
                <div>
                  <label className="form-label">Expected Date</label>
                  <input type="date" className="form-input" value={form.expected_date} onChange={(e) => setForm({ ...form, expected_date: e.target.value })} />
                </div>
              )}
              {docType === 'receipt' && (
                <div>
                  <label className="form-label">Payment Method</label>
                  <select className="form-input" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold gradient-text">Items</h3>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary btn-sm" onClick={addBlankItem}>+ Manual Item</button>
                <button type="button" className="btn-primary btn-sm" onClick={() => setProductModalOpen(true)}>+ From Products</button>
              </div>
            </div>

            {lineItems.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-dim)' }}>No items added yet. Click the buttons above to add items.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Item</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th style={{ width: '60px' }}>Unit</th>
                      <th style={{ width: '120px' }}>Rate</th>
                      <th style={{ width: '80px' }}>GST %</th>
                      <th style={{ width: '120px' }}>Amount</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            className="form-input"
                            style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                            value={item.product_name}
                            onChange={(e) => updateLineItem(i, 'product_name', e.target.value)}
                            placeholder="Item name"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                            value={item.quantity}
                            onChange={(e) => updateLineItem(i, 'quantity', Number(e.target.value))}
                            min="0.01"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                            value={item.unit}
                            onChange={(e) => updateLineItem(i, 'unit', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(i, 'unit_price', Number(e.target.value))}
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                            value={item.gst_percent}
                            onChange={(e) => updateLineItem(i, 'gst_percent', Number(e.target.value))}
                            step="0.01"
                          />
                        </td>
                        <td className="text-right font-semibold" style={{ color: 'var(--color-success)' }}>
                          ₹{(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeLineItem(i)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none text-lg"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {lineItems.length > 0 && (
              <div className="flex justify-end mt-6">
                <div style={{ width: '300px' }}>
                  <div className="flex justify-between py-2 text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>Tax (GST)</span>
                    <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm gap-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>Other Charges</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', textAlign: 'right' }}
                      value={form.other_charges}
                      onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })}
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="taxable"
                      checked={form.other_charges_taxable}
                      onChange={(e) => setForm({ ...form, other_charges_taxable: e.target.checked })}
                    />
                    <label htmlFor="taxable" className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Other charges taxable</label>
                  </div>
                  <div
                    className="flex justify-between py-3 mt-2 text-lg font-bold"
                    style={{ borderTop: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoice payment info */}
          {docType === 'invoice' && (
            <div className="card mb-6">
              <h3 className="text-lg font-bold gradient-text mb-4">Payment Info</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Paid Amount</label>
                  <input type="number" className="form-input" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} step="0.01" />
                </div>
                <div>
                  <label className="form-label">Paid Date</label>
                  <input type="date" className="form-input" value={form.paid_date} onChange={(e) => setForm({ ...form, paid_date: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Payment Notes</label>
                  <input className="form-input" value={form.payment_notes} onChange={(e) => setForm({ ...form, payment_notes: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          <div className="card mb-6">
            <h3 className="text-lg font-bold gradient-text mb-4">Notes & Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">Terms &amp; Conditions</label>
                  {terms.length > 0 && (
                    <select
                      className="form-input"
                      style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      value=""
                      onChange={(e) => setForm({ ...form, terms_content: e.target.value })}
                    >
                      <option value="">Load saved terms...</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.content}>{t.content.substring(0, 50)}...</option>
                      ))}
                    </select>
                  )}
                </div>
                <textarea className="form-input" rows={3} value={form.terms_content} onChange={(e) => setForm({ ...form, terms_content: e.target.value })} placeholder="Terms and conditions..." />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : `Create ${docLabel}`}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Customer Modal */}
      <Modal isOpen={customerModalOpen} onClose={() => setCustomerModalOpen(false)} title="Select Customer" size="md">
        {newCustMode ? (
          <div className="space-y-3">
            <input className="form-input" placeholder="Name *" value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} />
            <input className="form-input" placeholder="Company" value={newCust.company_name} onChange={(e) => setNewCust({ ...newCust, company_name: e.target.value })} />
            <input className="form-input" placeholder="Email" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} />
            <input className="form-input" placeholder="Mobile" value={newCust.mobile} onChange={(e) => setNewCust({ ...newCust, mobile: e.target.value })} />
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setNewCustMode(false)}>Back</button>
              <button type="button" className="btn-primary flex-1" onClick={handleCreateCustomer}>Create</button>
            </div>
          </div>
        ) : (
          <>
            <input
              className="form-input mb-4"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onClick={() => handleSelectCustomer(c)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    {[c.company_name, c.email].filter(Boolean).join(' • ')}
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-dim)' }}>No customers found</p>
              )}
            </div>
            <button type="button" className="btn-secondary w-full" onClick={() => setNewCustMode(true)}>+ Create New Customer</button>
          </>
        )}
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} title="Add Product" size="md">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={() => addProduct(p)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div>
                <div className="font-semibold">{p.product_name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  {p.unit} • GST {p.gst_percent}%{p.hsn_code ? ` • HSN: ${p.hsn_code}` : ''}
                </div>
              </div>
              <div className="font-bold" style={{ color: 'var(--color-success)' }}>₹{Number(p.price).toFixed(2)}</div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-dim)' }}>No products. Create products first.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
