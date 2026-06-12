from django.urls import path
from .views import (
    # Existing views — DO NOT REMOVE
    upload_csv,
    dashboard,
    product_analysis,
    insights,
    recommendations,
    # New CRUD views
    products_list,
    add_product,
    product_detail,
    sales_list,
    add_sale,
    sale_detail,
    clear_sales,
    clear_products,   # <-- ADD THIS LINE
    predictions,
)

urlpatterns = [
    # ── Existing endpoints (unchanged) ──
    path("upload-csv/",       upload_csv),
    path("dashboard/",        dashboard),
    path("product-analysis/", product_analysis),
    path("insights/",         insights),
    path("recommendations/",  recommendations),

    # ── Product Management ──
    path("products/",              products_list),
    path("add-product/",           add_product),
    path("products/<int:product_id>/", product_detail),
    path("clear-products/",        clear_products),

    # ── Sales Management ──
        # ── Sales Management ──
    path("sales/",                 sales_list),
    path("add-sale/",              add_sale),
    path("sales/<int:sale_id>/",   sale_detail),
    path("clear-sales/",           clear_sales),

    path("predictions/",           predictions),
]
