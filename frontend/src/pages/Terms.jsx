import { useState, useEffect } from 'react';
import { getTerms, createTerm, updateTerm, deleteTerm } from '../api/terms';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const types = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'purchase_order', label: 'Purchase Order' },
];

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: 'quotation', content: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchTerms(); }, [activeType]);

  const fetchTerms = async () => {
    try {
      const res = await getTerms(activeType);
      setTerms(res.data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load terms' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ type: activeType || 'quotation', content: '' });
    setModalOpen(true);
  };

  const openEdit = (term) => {
    setEditing(term);
    setForm({ type: term.type, content: term.content });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return setToast({ type: 'error', message: 'Content is required' });

    setSaving(true);
    try {
      if (editing) {
        await updateTerm(editing.id, form);
        setToast({ type: 'success', message: 'Term updated' });
      } else {
        await createTerm(form);
        setToast({ type: 'success', message: 'Term created' });
      }
      setModalOpen(false);
      fetchTerms();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this term?')) return;
    try {
      await deleteTerm(id);
      setToast({ type: 'success', message: 'Term deleted' });
      fetchTerms();
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">Terms & Conditions</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Terms</button>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!activeType ? 'text-white' : ''}`}
          style={{
            background: !activeType ? 'var(--color-primary)' : 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            color: !activeType ? 'white' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveType('')}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t.value}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeType === t.value ? 'var(--color-primary)' : 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              color: activeType === t.value ? 'white' : 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
            onClick={() => setActiveType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner"></div></div>
      ) : terms.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No terms yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Add terms & conditions to use in your documents</p>
          <button className="btn-primary" onClick={openCreate}>+ Add Terms</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {terms.map((term) => (
            <div key={term.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="badge badge-info mb-2">{types.find((t) => t.value === term.type)?.label || term.type}</span>
                  <p className="text-sm whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>{term.content}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(term)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(term.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Terms' : 'Add Terms'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Type</label>
            <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Content *</label>
            <textarea className="form-input" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required placeholder="Enter terms and conditions..." />
          </div>
          <div className="flex justify-end gap-3">
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
