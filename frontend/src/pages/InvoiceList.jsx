import DocumentList from '../components/DocumentList';
import { getInvoices, deleteInvoice } from '../api/documents';

export default function InvoiceList() {
  return (
    <DocumentList
      docType="invoice"
      docLabel="Invoices"
      fetchDocs={getInvoices}
      deleteFn={deleteInvoice}
      newPath="/invoices/new"
      pdfType="invoice"
      extraColumns={[
        {
          header: 'Paid',
          render: (doc) => (
            <span style={{ color: doc.paid_amount >= doc.total ? '#22c55e' : '#f59e0b' }}>
              ₹{Number(doc.paid_amount || 0).toFixed(2)}
            </span>
          ),
        },
      ]}
    />
  );
}
