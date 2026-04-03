import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getBusinessProfile, createBusinessProfile, updateBusinessProfile, uploadLogo, uploadSignature } from '../api/business';
import Toast from '../components/Toast';

const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];
const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
const taxLabels = ['GST', 'PAN', 'VAT', 'TIN', 'Custom'];

const Section = ({ title, children }) => (
  <div className="card mb-6">
    <h3 className="text-lg font-bold mb-4 gradient-text">{title}</h3>
    {children}
  </div>
);

export default function BusinessSetup() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [form, setForm] = useState({
    business_name: '', contact_name: '', email: '', phone: '',
    address_line1: '', address_line2: '', additional_info: '',
    tax_label: 'GST', tax_number: '', state: '', country: 'India',
    account_name: '', account_number: '', bank_name: '', upi_id: '',
    date_format: 'DD/MM/YYYY', currency: 'INR',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getBusinessProfile();
      setForm({ ...form, ...res.data });
      setIsEdit(true);
    } catch {
      // No profile yet
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim()) {
      return setToast({ type: 'error', message: 'Business name is required' });
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateBusinessProfile(form);
      } else {
        await createBusinessProfile(form);
        setIsEdit(true);
      }

      // Upload files if selected
      if (logoFile) await uploadLogo(logoFile);
      if (signatureFile) await uploadSignature(signatureFile);

      await refreshUser();
      setToast({ type: 'success', message: 'Business profile saved!' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex justify-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit' : 'Setup'} Business Profile</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {isEdit ? 'Update your business details' : 'Set up your business details to get started'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Branding */}
          <Section title="Branding">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div>
                <label className="form-label">Signature</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files[0])}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>
          </Section>

          {/* Business Info */}
          <Section title="Business Information">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Business Name *</label>
                <input className="form-input" value={form.business_name} onChange={(e) => handleChange('business_name', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Contact Name</label>
                <input className="form-input" value={form.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Address Line 1</label>
                <input className="form-input" value={form.address_line1} onChange={(e) => handleChange('address_line1', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Address Line 2</label>
                <input className="form-input" value={form.address_line2} onChange={(e) => handleChange('address_line2', e.target.value)} />
              </div>
              <div>
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input className="form-input" value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Additional Info</label>
                <textarea className="form-input" rows={2} value={form.additional_info} onChange={(e) => handleChange('additional_info', e.target.value)} />
              </div>
            </div>
          </Section>

          {/* Tax Info */}
          <Section title="Tax Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tax Label</label>
                <select className="form-input" value={form.tax_label} onChange={(e) => handleChange('tax_label', e.target.value)}>
                  {taxLabels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Tax Number</label>
                <input className="form-input" value={form.tax_number} onChange={(e) => handleChange('tax_number', e.target.value)} placeholder="e.g., 22XXXXX1234X1Z5" />
              </div>
            </div>
          </Section>

          {/* Bank Details */}
          <Section title="Bank Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Account Name</label>
                <input className="form-input" value={form.account_name} onChange={(e) => handleChange('account_name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Account Number</label>
                <input className="form-input" value={form.account_number} onChange={(e) => handleChange('account_number', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Bank Name</label>
                <input className="form-input" value={form.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">UPI ID (for QR Code)</label>
                <input className="form-input" value={form.upi_id} onChange={(e) => handleChange('upi_id', e.target.value)} placeholder="business@upi" />
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Date Format</label>
                <select className="form-input" value={form.date_format} onChange={(e) => handleChange('date_format', e.target.value)}>
                  {dateFormats.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select className="form-input" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
