import io
import base64
import qrcode


def generate_upi_qr(upi_id: str, payee_name: str, amount: float = None, currency: str = "INR") -> str:
    """
    Generate UPI QR code and return as base64 data URI.

    UPI URI format: upi://pay?pa={upi_id}&pn={name}&am={amount}&cu={currency}
    """
    upi_uri = f"upi://pay?pa={upi_id}&pn={payee_name}"
    if amount and amount > 0:
        upi_uri += f"&am={amount:.2f}"
    upi_uri += f"&cu={currency}"

    qr = qrcode.QRCode(version=1, box_size=6, border=2)
    qr.add_data(upi_uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"
