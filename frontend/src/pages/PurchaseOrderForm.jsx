import DocumentForm from '../components/DocumentForm';
import { createPurchaseOrder } from '../api/documents';

export default function PurchaseOrderForm() {
  return (
    <DocumentForm
      docType="purchase_order"
      docLabel="Purchase Order"
      onSubmit={(data) => createPurchaseOrder(data)}
    />
  );
}
