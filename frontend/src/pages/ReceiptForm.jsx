import DocumentForm from '../components/DocumentForm';
import { createReceipt } from '../api/documents';

export default function ReceiptForm() {
  return (
    <DocumentForm
      docType="receipt"
      docLabel="Receipt"
      onSubmit={(data) => createReceipt(data)}
    />
  );
}
