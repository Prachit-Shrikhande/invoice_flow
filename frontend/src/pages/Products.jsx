import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const units = ['PCS', 'SET', 'KG', 'GM', 'LTR', 'ML', 'MTR', 'CM', 'SQ.FT', 'BOX', 'PAIR', 'DOZEN', 'HR', 'DAY'];

const emptyProduct = {
  product_name: '', price: '', unit: 'PCS', gst_percent: '', description: '', hsn_code: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct });
    setModalOpen(true);
  };

  const openEdit = (prod) => {
    setEditing(prod);
    setForm({
      product_name: prod.product_name,
      price: prod.price,
      unit: prod.unit,
      gst_percent: prod.gst_percent,
      description: prod.description || '',
      hsn_code: prod.hsn_code || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product_name.trim()) return setToast({ type: 'error', message: 'Product name required' });
    if (!form.price || Number(form.price) <= 0) return setToast({ type: 'error', message: 'Valid price required' });

    const data = { ...form, price: Number(form.price), gst_percent: Number(form.gst_percent) || 0 };

    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        setToast({ type: 'success', message: 'Product updated' });
      } else {
        await createProduct(data);
        setToast({ type: 'success', message: 'Product created' });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setToast({ type: 'success', message: 'Product deleted' });
      fetchProducts();
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Add products to use in your documents</p>
          <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Unit</th>
                <th>GST %</th>
                <th>HSN</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold">{p.product_name}</div>
                    {p.description && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{p.description}</div>}
                  </td>
                  <td className="font-semibold" style={{ color: 'var(--color-success)' }}>₹{Number(p.price).toFixed(2)}</td>
                  <td><span className="badge badge-info">{p.unit}</span></td>
                  <td>{p.gst_percent}%</td>
                  <td style={{ color: 'var(--color-text-dim)' }}>{p.hsn_code || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Price *</label>
              <input type="number" step="0.01" className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Unit</label>
              <select className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">GST %</label>
              <input type="number" step="0.01" className="form-input" value={form.gst_percent} onChange={(e) => setForm({ ...form, gst_percent: e.target.value })} placeholder="18" />
            </div>
          </div>
          <div>
            <label className="form-label">HSN Code</label>
            <input className="form-input" value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
