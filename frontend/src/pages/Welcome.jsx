import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🧾', title: 'Invoices', desc: 'Create professional invoices with auto-calculations and tax support.' },
  { icon: '📝', title: 'Quotations', desc: 'Generate beautiful quotations and convert them to invoices.' },
  { icon: '🛒', title: 'Purchase Orders', desc: 'Manage vendor purchase orders with full tracking.' },
  { icon: '🗂️', title: 'Receipts', desc: 'Generate payment receipts for completed transactions.' },
  { icon: '📄', title: 'PDF Export', desc: 'Download or preview professional PDF documents.' },
  { icon: '📱', title: 'UPI QR Codes', desc: 'Auto-generate UPI QR codes on invoices for instant payment.' },
];

export default function Welcome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg font-bold text-white text-lg"
            style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4361ee, #3a0ca3)' }}
          >
            IF
          </div>
          <span className="font-bold text-xl gradient-text">InvoiceFlow</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/signin" className="btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn-primary">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-block mb-6 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(67, 97, 238, 0.15)', color: '#4361ee' }}
          >
            ✨ Professional Business Documents in Seconds
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Generate Invoices,</span>
            <br />
            <span style={{ color: 'var(--color-text)' }}>Quotations &amp; More</span>
          </h1>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            InvoiceFlow helps businesses create beautiful, professional invoices, quotations,
            purchase orders, and receipts — complete with GST, UPI QR codes, and PDF export.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Start Free Now →
            </Link>
            <Link to="/signin" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Everything You Need
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(67, 97, 238, 0.4)' }}
            >
              <div className="text-3xl mb-4">{feat.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 text-center text-sm" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}>
        © 2026 InvoiceFlow. Built for modern businesses.
      </footer>
    </div>
  );
}
