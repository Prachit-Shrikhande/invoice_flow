import DocumentList from '../components/DocumentList';
import { getQuotations, deleteQuotation } from '../api/documents';

export default function QuotationList() {
  return (
    <DocumentList
      docType="quotation"
      docLabel="Quotations"
      fetchDocs={getQuotations}
      deleteFn={deleteQuotation}
      newPath="/quotations/new"
      pdfType="quotation"
    />
  );
}
