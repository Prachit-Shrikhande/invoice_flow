import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/business-setup', label: 'Business Profile', icon: '🏢' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { path: '/customers', label: 'Customers', icon: '👥' },
      { path: '/products', label: 'Products', icon: '📦' },
      { path: '/terms', label: 'Terms & Conditions', icon: '📋' },
    ],
  },
  {
    label: 'Documents',
    items: [
      { path: '/quotations/new', label: 'New Quotation', icon: '📝' },
      { path: '/quotations', label: 'Quotations', icon: '📄' },
      { path: '/invoices/new', label: 'New Invoice', icon: '🧾' },
      { path: '/invoices', label: 'Invoices', icon: '📑' },
      { path: '/purchase-orders/new', label: 'New PO', icon: '🛒' },
      { path: '/purchase-orders', label: 'Purchase Orders', icon: '📋' },
      { path: '/receipts/new', label: 'New Receipt', icon: '🧾' },
      { path: '/receipts', label: 'Receipts', icon: '🗂️' },
    ],
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '72px' : '260px',
          background: 'var(--color-surface-light)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer"
          style={{ borderBottom: '1px solid var(--color-border)' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div
            className="flex items-center justify-center rounded-lg font-bold text-white text-lg"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
              flexShrink: 0,
            }}
          >
            IF
          </div>
          {!collapsed && (
            <span className="font-bold text-lg gradient-text">InvoiceFlow</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div
                  className="px-4 py-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all duration-150"
                    title={collapsed ? item.label : ''}
                    style={{
                      background: isActive ? 'rgba(67, 97, 238, 0.15)' : 'transparent',
                      color: isActive ? '#4361ee' : 'var(--color-text-muted)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '400',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.target.style.background = 'var(--color-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.target.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center rounded-full font-semibold text-white text-sm"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #f72585, #b5179e)',
                flexShrink: 0,
              }}
            >
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate">{user?.full_name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{user?.email}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-center py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            {collapsed ? '🚪' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
        {children}
      </main>
    </div>
  );
}
