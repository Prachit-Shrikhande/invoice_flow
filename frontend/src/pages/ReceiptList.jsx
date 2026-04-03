import DocumentList from '../components/DocumentList';
import { getReceipts, deleteReceipt } from '../api/documents';

export default function ReceiptList() {
  return (
    <DocumentList
      docType="receipt"
      docLabel="Receipts"
      fetchDocs={getReceipts}
      deleteFn={deleteReceipt}
      newPath="/receipts/new"
      pdfType="receipt"
      extraColumns={[
        {
          header: 'Method',
          render: (doc) => (
            <span className="badge badge-info">{doc.payment_method || '-'}</span>
          ),
        },
      ]}
    />
  );
}
