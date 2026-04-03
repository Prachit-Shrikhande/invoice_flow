import pytest
from app.services.document_service import calculate_document_totals

class DummyItem:
    def __init__(self, product_id, product_name, quantity, unit_price, gst_percent, hsn_code=None, unit="PCS"):
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price
        self.gst_percent = gst_percent
        self.hsn_code = hsn_code
        self.unit = unit

def test_calculate_document_totals_simple():
    items = [
        DummyItem(1, "Product A", 2, 100.0, 18.0)
    ]
    # quantity=2, price=100 -> amount = 200
    # gst 18% -> 36
    # other_charges = 0
    # subtotal = 200, tax = 36, total = 236
    subtotal, tax_amount, total, processed_items = calculate_document_totals(items, 0, False)
    
    assert subtotal == 200.0
    assert tax_amount == 36.0
    assert total == 236.0
    assert len(processed_items) == 1

def test_calculate_document_totals_complex():
    items = [
        DummyItem(1, "Product A", 1.5, 100.0, 18.0), # amount = 150, tax = 27
        DummyItem(2, "Product B", 3, 50.0, 5.0)      # amount = 150, tax = 7.5
    ]
    # subtotal = 300
    # tax = 34.5
    # other charges = 50, taxable = True
    # other tax = 50 * (34.5 / 300) = 50 * 0.115 = 5.75
    # total tax = 34.5 + 5.75 = 40.25
    # total = 300 + 40.25 + 50 = 390.25

    subtotal, tax_amount, total, processed_items = calculate_document_totals(items, 50, True)

    assert subtotal == 300.0
    assert tax_amount == 40.25
    assert total == 390.25
    assert len(processed_items) == 2
    assert processed_items[0]["amount"] == 150.0
