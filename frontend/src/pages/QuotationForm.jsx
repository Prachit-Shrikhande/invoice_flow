import DocumentForm from '../components/DocumentForm';
import { createQuotation } from '../api/documents';

export default function QuotationForm() {
  return (
    <DocumentForm
      docType="quotation"
      docLabel="Quotation"
      onSubmit={(data) => createQuotation(data)}
    />
  );
}
