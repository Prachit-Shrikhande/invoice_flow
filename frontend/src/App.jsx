import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Welcome from './pages/Welcome';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import BusinessSetup from './pages/BusinessSetup';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Terms from './pages/Terms';
import QuotationForm from './pages/QuotationForm';
import QuotationList from './pages/QuotationList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceList from './pages/InvoiceList';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import PurchaseOrderList from './pages/PurchaseOrderList';
import ReceiptForm from './pages/ReceiptForm';
import ReceiptList from './pages/ReceiptList';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/business-setup" element={<ProtectedRoute><Layout><BusinessSetup /></Layout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><Layout><Terms /></Layout></ProtectedRoute>} />

      {/* Quotations */}
      <Route path="/quotations" element={<ProtectedRoute><Layout><QuotationList /></Layout></ProtectedRoute>} />
      <Route path="/quotations/new" element={<ProtectedRoute><Layout><QuotationForm /></Layout></ProtectedRoute>} />

      {/* Invoices */}
      <Route path="/invoices" element={<ProtectedRoute><Layout><InvoiceList /></Layout></ProtectedRoute>} />
      <Route path="/invoices/new" element={<ProtectedRoute><Layout><InvoiceForm /></Layout></ProtectedRoute>} />

      {/* Purchase Orders */}
      <Route path="/purchase-orders" element={<ProtectedRoute><Layout><PurchaseOrderList /></Layout></ProtectedRoute>} />
      <Route path="/purchase-orders/new" element={<ProtectedRoute><Layout><PurchaseOrderForm /></Layout></ProtectedRoute>} />

      {/* Receipts */}
      <Route path="/receipts" element={<ProtectedRoute><Layout><ReceiptList /></Layout></ProtectedRoute>} />
      <Route path="/receipts/new" element={<ProtectedRoute><Layout><ReceiptForm /></Layout></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
