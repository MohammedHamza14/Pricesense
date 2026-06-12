from django.forms.models import model_to_dict
from .models import Product, SalesRecord


def serialize_product(product):
    return {
        "id": product.id,
        "name": product.name,
        "current_price": product.current_price,
    }


def serialize_sale(sale):
    return {
        "id": sale.id,
        "product": sale.product.id,
        "product_name": sale.product.name,
        "sale_date": str(sale.sale_date),
        "price": sale.price,
        "quantity_sold": sale.quantity_sold,
        "revenue": round(sale.price * sale.quantity_sold, 2),
    }
