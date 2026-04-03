import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';

/**
 * Reusable document list for Quotations, Invoices, POs, Receipts.
 *
 * Props:
 *  - docType: 'quotation'|'invoice'|'purchase_order'|'receipt'
 *  - docLabel: display name (plural)
 *  - fetchDocs: async () => response
 *  - deleteFn: async (id) => response
 *  - newPath: route for new document
 *  - pdfType: type string for PDF URL
 *  - extraColumns: optional array of { header, render(doc) }
 */
export default function DocumentList({ docType, docLabel, fetchDocs, deleteFn, newPath, pdfType, extraColumns = [] }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const res = await fetchDocs();
      setDocs(res.data);
    } catch {
      setToast({ type: 'error', message: `Failed to load ${docLabel.toLowerCase()}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete this ${docType.replace('_', ' ')}?`)) return;
    try {
      await deleteFn(id);
      setToast({ type: 'success', message: 'Deleted successfully' });
      loadDocs();
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  const openPdf = (id, action) => {
    const token = localStorage.getItem('token');
    window.open(`/api/pdf/${pdfType}/${id}/${action}?token=${token}`, '_blank');
  };

  const statusColors = {
    draft: 'badge-warning',
    sent: 'badge-info',
    paid: 'badge-success',
    completed: 'badge-success',
    overdue: 'badge-danger',
    cancelled: 'badge-danger',
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">{docLabel}</h1>
        <Link to={newPath} className="btn-primary">+ New {docType.replace('_', ' ')}</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner"></div></div>
      ) : docs.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">No {docLabel.toLowerCase()} yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Create your first {docType.replace('_', ' ')}</p>
          <Link to={newPath} className="btn-primary">+ Create {docType.replace('_', ' ')}</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                {extraColumns.map((col) => (
                  <th key={col.header}>{col.header}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-primary)' }}>{doc.document_number}</td>
                  <td>{doc.customer?.name || 'Unknown'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{doc.date}</td>
                  <td className="font-bold" style={{ color: 'var(--color-success)' }}>₹{Number(doc.total).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusColors[doc.status] || 'badge-info'}`}>{doc.status}</span>
                  </td>
                  {extraColumns.map((col) => (
                    <td key={col.header}>{col.render(doc)}</td>
                  ))}
                  <td>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => openPdf(doc.id, 'preview')}
                      >
                        Preview
                      </button>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => openPdf(doc.id, 'download')}
                      >
                        PDF
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
