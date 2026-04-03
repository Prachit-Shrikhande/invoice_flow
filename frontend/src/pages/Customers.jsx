import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const emptyCustomer = {
  name: '', company_name: '', email: '', mobile: '',
  address_line1: '', address_line2: '', address_line3: '',
  gstin: '', state: '', shipping_address: '',
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyCustomer });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async (q = '') => {
    try {
      const res = await getCustomers(q);
      setCustomers(res.data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load customers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    fetchCustomers(val);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCustomer });
    setModalOpen(true);
  };

  const openEdit = (cust) => {
    setEditing(cust);
    setForm({ ...cust });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setToast({ type: 'error', message: 'Name is required' });
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, form);
        setToast({ type: 'success', message: 'Customer updated' });
      } else {
        await createCustomer(form);
        setToast({ type: 'success', message: 'Customer created' });
      }
      setModalOpen(false);
      fetchCustomers(search);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setToast({ type: 'success', message: 'Customer deleted' });
      fetchCustomers(search);
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Customer</button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          className="form-input"
          style={{ maxWidth: '400px' }}
          placeholder="Search customers..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner"></div></div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Add your first customer to get started</p>
          <button className="btn-primary" onClick={openCreate}>+ Add Customer</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>GSTIN</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{c.company_name || '-'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{c.email || '-'}</td>
                  <td>{c.mobile || '-'}</td>
                  <td style={{ color: 'var(--color-text-dim)' }}>{c.gstin || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Company Name</label>
              <input className="form-input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Mobile</label>
              <input className="form-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div>
              <label className="form-label">GSTIN</label>
              <input className="form-input" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Address Line 1</label>
              <input className="form-input" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Address Line 2</label>
              <input className="form-input" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Address Line 3</label>
              <input className="form-input" value={form.address_line3} onChange={(e) => setForm({ ...form, address_line3: e.target.value })} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Shipping Address</label>
              <textarea className="form-input" rows={2} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
