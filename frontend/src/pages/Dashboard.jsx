import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';
import { getInvoices, getQuotations, getPurchaseOrders, getReceipts } from '../api/documents';

const quickActions = [
  { path: '/quotations/new', label: 'New Quotation', icon: '📝', color: '#4361ee' },
  { path: '/invoices/new', label: 'New Invoice', icon: '🧾', color: '#f72585' },
  { path: '/purchase-orders/new', label: 'New PO', icon: '🛒', color: '#4cc9f0' },
  { path: '/receipts/new', label: 'New Receipt', icon: '🗂️', color: '#22c55e' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0, products: 0,
    quotations: 0, invoices: 0,
    purchaseOrders: 0, receipts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cust, prod, quo, inv, po, rec] = await Promise.all([
          getCustomers().catch(() => ({ data: [] })),
          getProducts().catch(() => ({ data: [] })),
          getQuotations().catch(() => ({ data: [] })),
          getInvoices().catch(() => ({ data: [] })),
          getPurchaseOrders().catch(() => ({ data: [] })),
          getReceipts().catch(() => ({ data: [] })),
        ]);
        setStats({
          customers: cust.data.length,
          products: prod.data.length,
          quotations: quo.data.length,
          invoices: inv.data.length,
          purchaseOrders: po.data.length,
          receipts: rec.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Customers', value: stats.customers, icon: '👥', color: '#4361ee', path: '/customers' },
    { label: 'Products', value: stats.products, icon: '📦', color: '#f72585', path: '/products' },
    { label: 'Quotations', value: stats.quotations, icon: '📄', color: '#4cc9f0', path: '/quotations' },
    { label: 'Invoices', value: stats.invoices, icon: '🧾', color: '#22c55e', path: '/invoices' },
    { label: 'Purchase Orders', value: stats.purchaseOrders, icon: '🛒', color: '#f59e0b', path: '/purchase-orders' },
    { label: 'Receipts', value: stats.receipts, icon: '🗂️', color: '#a855f7', path: '/receipts' },
  ];

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Here's what's happening with your business today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={stat.path} className="card block text-center hover:scale-[1.02] transition-transform" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4 gradient-text">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Link
              to={action.path}
              className="card flex flex-col items-center gap-3 py-8 hover:scale-[1.03] transition-transform"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                borderColor: `${action.color}30`,
                background: `linear-gradient(135deg, ${action.color}08, ${action.color}03)`,
              }}
            >
              <div className="text-4xl">{action.icon}</div>
              <span className="font-semibold text-sm">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Discover Section */}
      <h2 className="text-xl font-bold mb-4 gradient-text">Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { path: '/quotations', label: 'Quotation List', icon: '📄' },
          { path: '/invoices', label: 'Invoice List', icon: '📑' },
          { path: '/purchase-orders', label: 'PO List', icon: '📋' },
          { path: '/receipts', label: 'Receipt List', icon: '🗂️' },
          { path: '/business-setup', label: 'Business Profile', icon: '🏢' },
          { path: '/customers', label: 'Manage Customers', icon: '👥' },
          { path: '/products', label: 'Manage Products', icon: '📦' },
          { path: '/terms', label: 'Terms & Conditions', icon: '⚖️' },
        ].map((item, i) => (
          <motion.div
            key={item.path + item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.03 }}
          >
            <Link
              to={item.path}
              className="card flex items-center gap-3 py-3 hover:scale-[1.01] transition-transform"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
