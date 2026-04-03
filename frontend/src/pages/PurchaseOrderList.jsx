import DocumentList from '../components/DocumentList';
import { getPurchaseOrders, deletePurchaseOrder } from '../api/documents';

export default function PurchaseOrderList() {
  return (
    <DocumentList
      docType="purchase_order"
      docLabel="Purchase Orders"
      fetchDocs={getPurchaseOrders}
      deleteFn={deletePurchaseOrder}
      newPath="/purchase-orders/new"
      pdfType="purchase_order"
    />
  );
}
