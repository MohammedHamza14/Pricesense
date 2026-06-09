from django.http import JsonResponse
from .models import Product, SalesRecord
import pandas as pd
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload_csv(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=400
        )

    csv_file = request.FILES.get("file")

    if not csv_file:
        return JsonResponse(
            {"error": "No file uploaded"},
            status=400
        )

    df = pd.read_csv(csv_file)

    for _, row in df.iterrows():

        product, created = Product.objects.get_or_create(
            name=row["product_name"],
            defaults={
                "current_price": row["price"]
            }
        )

        SalesRecord.objects.create(
            product=product,
            sale_date=row["date"],
            price=row["price"],
            quantity_sold=row["quantity_sold"]
        )

    return JsonResponse({
        "message": "CSV uploaded successfully"
    })
@csrf_exempt
def dashboard(request):

    total_products = Product.objects.count()

    total_sales_records = SalesRecord.objects.count()

    total_revenue = sum(
        sale.price * sale.quantity_sold
        for sale in SalesRecord.objects.all()
    )

    return JsonResponse({
        "total_products": total_products,
        "total_sales_records": total_sales_records,
        "total_revenue": total_revenue
    })