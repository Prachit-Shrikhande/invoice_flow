import DocumentForm from '../components/DocumentForm';
import { createInvoice } from '../api/documents';

export default function InvoiceForm() {
  return (
    <DocumentForm
      docType="invoice"
      docLabel="Invoice"
      onSubmit={(data) => createInvoice(data)}
    />
  );
}
