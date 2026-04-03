import api from './axios';

// Quotations
export const getQuotations = () => api.get('/quotations');
export const getQuotation = (id) => api.get(`/quotations/${id}`);
export const createQuotation = (data) => api.post('/quotations', data);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}`);

// Invoices
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// Purchase Orders
export const getPurchaseOrders = () => api.get('/purchase-orders');
export const getPurchaseOrder = (id) => api.get(`/purchase-orders/${id}`);
export const createPurchaseOrder = (data) => api.post('/purchase-orders', data);
export const deletePurchaseOrder = (id) => api.delete(`/purchase-orders/${id}`);

// Receipts
export const getReceipts = () => api.get('/receipts');
export const getReceipt = (id) => api.get(`/receipts/${id}`);
export const createReceipt = (data) => api.post('/receipts', data);
export const deleteReceipt = (id) => api.delete(`/receipts/${id}`);

// PDF
export const getDocumentPdfUrl = (docType, docId, action = 'preview') =>
  `/api/pdf/${docType}/${docId}/${action}`;
