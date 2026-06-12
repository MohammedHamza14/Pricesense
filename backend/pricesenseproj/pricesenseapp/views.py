from django.http import JsonResponse
from .models import Product, SalesRecord
import pandas as pd
import json
from django.views.decorators.csrf import csrf_exempt
from .serializers import serialize_product, serialize_sale
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from django.db.models import Sum

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
@csrf_exempt
def product_analysis(request):

    result = []

    products = Product.objects.all()

    for product in products:

        sales = SalesRecord.objects.filter(product=product)

        units_sold = sum(
            sale.quantity_sold
            for sale in sales
        )

        revenue = sum(
            sale.price * sale.quantity_sold
            for sale in sales
        )

        result.append({
            "product": product.name,
            "units_sold": units_sold,
            "revenue": revenue
        })

    return JsonResponse(
        result,
        safe=False
    )
@csrf_exempt
def insights(request):

    product_stats = []

    for product in Product.objects.all():

        sales = SalesRecord.objects.filter(product=product)

        units_sold = sum(
            sale.quantity_sold
            for sale in sales
        )

        revenue = sum(
            sale.price * sale.quantity_sold
            for sale in sales
        )

        product_stats.append({
            "product": product.name,
            "units_sold": units_sold,
            "revenue": revenue
        })

    best_seller = max(
        product_stats,
        key=lambda x: x["units_sold"]
    )

    worst_seller = min(
        product_stats,
        key=lambda x: x["units_sold"]
    )

    highest_revenue = max(
        product_stats,
        key=lambda x: x["revenue"]
    )

    return JsonResponse({
        "best_seller": best_seller["product"],
        "worst_seller": worst_seller["product"],
        "highest_revenue_product": highest_revenue["product"]
    })
@csrf_exempt
def recommendations(request):

    recommendations = []

    product_stats = []

    for product in Product.objects.all():

        sales = SalesRecord.objects.filter(product=product)

        revenue = sum(
            sale.price * sale.quantity_sold
            for sale in sales
        )

        units_sold = sum(
            sale.quantity_sold
            for sale in sales
        )

        product_stats.append({
            "product": product.name,
            "revenue": revenue,
            "units_sold": units_sold
        })

    best_product = max(
        product_stats,
        key=lambda x: x["revenue"]
    )

    for product in product_stats:

        if product["revenue"] < best_product["revenue"] * 0.5:

            recommendations.append(
                f"{product['product']} is generating significantly lower revenue than {best_product['product']}. Consider promotions or discounts."
            )


    return JsonResponse({
        "recommendations": recommendations
    })


# ─────────────────────────────────────────────
# PRODUCT MANAGEMENT — new CRUD views
# ─────────────────────────────────────────────

@csrf_exempt
def products_list(request):
    """GET /api/products/ — list all products"""
    if request.method != "GET":
        return JsonResponse({"error": "GET request required"}, status=405)

    products = Product.objects.all().order_by("name")
    return JsonResponse(
        [serialize_product(p) for p in products],
        safe=False
    )


@csrf_exempt
def add_product(request):
    """POST /api/add-product/ — create a new product"""
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    name = (body.get("name") or "").strip()
    current_price = body.get("current_price")

    if not name:
        return JsonResponse({"error": "Product name is required"}, status=400)

    if current_price is None:
        return JsonResponse({"error": "current_price is required"}, status=400)

    try:
        current_price = float(current_price)
        if current_price < 0:
            raise ValueError
    except (TypeError, ValueError):
        return JsonResponse({"error": "current_price must be a non-negative number"}, status=400)

    if Product.objects.filter(name__iexact=name).exists():
        return JsonResponse({"error": f"Product '{name}' already exists"}, status=409)

    product = Product.objects.create(name=name, current_price=current_price)
    return JsonResponse(serialize_product(product), status=201)


@csrf_exempt
def product_detail(request, product_id):
    """PUT /api/products/<id>/ — update   DELETE /api/products/<id>/ — delete"""
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)

    if request.method == "PUT":
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        name = (body.get("name") or "").strip()
        current_price = body.get("current_price")

        if not name:
            return JsonResponse({"error": "Product name is required"}, status=400)

        if current_price is None:
            return JsonResponse({"error": "current_price is required"}, status=400)

        try:
            current_price = float(current_price)
            if current_price < 0:
                raise ValueError
        except (TypeError, ValueError):
            return JsonResponse({"error": "current_price must be a non-negative number"}, status=400)

        # Check uniqueness (excluding self)
        if Product.objects.filter(name__iexact=name).exclude(pk=product_id).exists():
            return JsonResponse({"error": f"Product '{name}' already exists"}, status=409)

        product.name = name
        product.current_price = current_price
        product.save()
        return JsonResponse(serialize_product(product))

    elif request.method == "DELETE":
        product_name = product.name
        product.delete()
        return JsonResponse({"message": f"Product '{product_name}' deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)


# ─────────────────────────────────────────────
# SALES MANAGEMENT — new CRUD views
# ─────────────────────────────────────────────

@csrf_exempt
def sales_list(request):
    """GET /api/sales/ — list all sales records"""
    if request.method != "GET":
        return JsonResponse({"error": "GET request required"}, status=405)

    sales = SalesRecord.objects.select_related("product").order_by("-sale_date", "-id")
    return JsonResponse(
        [serialize_sale(s) for s in sales],
        safe=False
    )


@csrf_exempt
def add_sale(request):
    """POST /api/add-sale/ — create a new sale record"""
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    product_id    = body.get("product_id")
    sale_date     = body.get("sale_date")
    price         = body.get("price")
    quantity_sold = body.get("quantity_sold")

    # Validate required fields
    errors = {}
    if not product_id:
        errors["product_id"] = "Required"
    if not sale_date:
        errors["sale_date"] = "Required (YYYY-MM-DD)"
    if price is None:
        errors["price"] = "Required"
    if quantity_sold is None:
        errors["quantity_sold"] = "Required"

    if errors:
        return JsonResponse({"error": "Validation failed", "fields": errors}, status=400)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"error": f"Product with id {product_id} not found"}, status=404)

    try:
        price = float(price)
        if price < 0:
            raise ValueError
    except (TypeError, ValueError):
        return JsonResponse({"error": "price must be a non-negative number"}, status=400)

    try:
        quantity_sold = int(quantity_sold)
        if quantity_sold < 1:
            raise ValueError
    except (TypeError, ValueError):
        return JsonResponse({"error": "quantity_sold must be a positive integer"}, status=400)

    sale = SalesRecord.objects.create(
        product=product,
        sale_date=sale_date,
        price=price,
        quantity_sold=quantity_sold,
    )
    return JsonResponse(serialize_sale(sale), status=201)


@csrf_exempt
def sale_detail(request, sale_id):
    """PUT /api/sales/<id>/ — update   DELETE /api/sales/<id>/ — delete"""
    try:
        sale = SalesRecord.objects.select_related("product").get(pk=sale_id)
    except SalesRecord.DoesNotExist:
        return JsonResponse({"error": "Sale record not found"}, status=404)

    if request.method == "PUT":
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        product_id    = body.get("product_id")
        sale_date     = body.get("sale_date")
        price         = body.get("price")
        quantity_sold = body.get("quantity_sold")

        if product_id is not None:
            try:
                sale.product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return JsonResponse({"error": f"Product with id {product_id} not found"}, status=404)

        if sale_date is not None:
            sale.sale_date = sale_date

        if price is not None:
            try:
                price = float(price)
                if price < 0:
                    raise ValueError
                sale.price = price
            except (TypeError, ValueError):
                return JsonResponse({"error": "price must be a non-negative number"}, status=400)

        if quantity_sold is not None:
            try:
                quantity_sold = int(quantity_sold)
                if quantity_sold < 1:
                    raise ValueError
                sale.quantity_sold = quantity_sold
            except (TypeError, ValueError):
                return JsonResponse({"error": "quantity_sold must be a positive integer"}, status=400)

        sale.save()
        return JsonResponse(serialize_sale(sale))

    elif request.method == "DELETE":
        sale_id_val = sale.id
        sale.delete()
        return JsonResponse({"message": f"Sale record {sale_id_val} deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)

# ─────────────────────────────────────────────
# CLEAR ALL SALES
# ─────────────────────────────────────────────

@csrf_exempt
def clear_sales(request):
    """DELETE /api/clear-sales/ — delete all sales records"""
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE request required"}, status=405)

    count, _ = SalesRecord.objects.all().delete()
    return JsonResponse({
        "success": True,
        "message": "All sales records deleted successfully"
    })
# ─────────────────────────────────────────────
# CLEAR ALL PRODUCTS
# ─────────────────────────────────────────────

@csrf_exempt
def clear_products(request):
    """DELETE /api/clear-products/ — delete all products (cascades to sales)"""
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE request required"}, status=405)

    try:
        count, _ = Product.objects.all().delete()
        return JsonResponse({
            "success": True,
            "message": "All products deleted successfully"
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Failed to delete products: {str(e)}"
        }, status=500)

@csrf_exempt
def predictions(request):
    """
    GET /api/predictions/
    AI-powered per-product sales prediction using Linear Regression on historical sales data.
    """
    if request.method != "GET":
        return JsonResponse({"error": "GET request required"}, status=405)

    try:
        # Get all products
        products = Product.objects.all()
        
        if not products.exists():
            return JsonResponse({
                "ai_enabled": False,
                "message": "No products found in database",
                "total_products_analyzed": 0,
                "product_predictions": []
            })

        product_predictions = []
        products_with_sufficient_data = 0

        # Process each product separately
        for product in products:
            # Get sales records for this specific product, ordered by date
            product_sales = SalesRecord.objects.filter(
                product=product
            ).order_by('sale_date')
            
            total_records = product_sales.count()
            
            # Edge case: Not enough data for this product
            if total_records < 2:
                product_predictions.append({
                    "product": product.name,
                    "ai_enabled": False,
                    "message": f"Insufficient data for {product.name}. Need at least 2 sales records.",
                    "total_records_available": total_records,
                    "predicted_next_day_sales": None,
                    "predicted_next_week_sales": None,
                    "trend": None,
                    "total_records_used": total_records,
                    "additional_insights": None
                })
                continue

            # Aggregate daily sales quantities for this product
            daily_sales = {}
            for record in product_sales:
                date_key = record.sale_date.strftime('%Y-%m-%d')
                if date_key in daily_sales:
                    daily_sales[date_key] += record.quantity_sold
                else:
                    daily_sales[date_key] = record.quantity_sold

            # Sort dates and prepare time series data
            sorted_dates = sorted(daily_sales.keys())
            quantities = [daily_sales[date] for date in sorted_dates]
            
            # Edge case: If after aggregation we still have less than 2 data points
            if len(quantities) < 2:
                product_predictions.append({
                    "product": product.name,
                    "ai_enabled": False,
                    "message": f"Insufficient unique days of data for {product.name}.",
                    "total_records_available": total_records,
                    "predicted_next_day_sales": None,
                    "predicted_next_week_sales": None,
                    "trend": None,
                    "total_records_used": total_records,
                    "additional_insights": None
                })
                continue

            # Create time index as feature
            X = np.array(range(1, len(quantities) + 1)).reshape(-1, 1)
            y = np.array(quantities)
            
            # Train Linear Regression model for this product
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict next day and next week
            next_day_index = np.array([[len(quantities) + 1]])
            next_week_index = np.array([[len(quantities) + 7]])
            
            predicted_next_day = model.predict(next_day_index)[0]
            predicted_next_week = model.predict(next_week_index)[0]
            
            # Ensure non-negative predictions
            predicted_next_day = max(0, round(predicted_next_day))
            predicted_next_week = max(0, round(predicted_next_week))
            
            # Determine trend based on model slope (coefficient)
            slope = model.coef_[0]
            
            if slope > 0.5:
                trend = "increasing"
            elif slope < -0.5:
                trend = "decreasing"
            else:
                trend = "stable"
            
            # Calculate additional insights
            avg_daily_sales = round(np.mean(quantities), 2)
            model_score = round(model.score(X, y), 3)
            
            # Determine confidence level
            if model_score > 0.7:
                prediction_confidence = "high"
            elif model_score > 0.4:
                prediction_confidence = "medium"
            else:
                prediction_confidence = "low"
            
            products_with_sufficient_data += 1
            
            product_predictions.append({
                "product": product.name,
                "ai_enabled": True,
                "predicted_next_day_sales": predicted_next_day,
                "predicted_next_week_sales": predicted_next_week,
                "trend": trend,
                "total_records_used": total_records,
                "additional_insights": {
                    "average_daily_sales": avg_daily_sales,
                    "model_accuracy_r2_score": model_score,
                    "total_unique_days": len(sorted_dates),
                    "prediction_confidence": prediction_confidence
                }
            })
        
        # Determine overall AI status
        overall_ai_enabled = products_with_sufficient_data > 0
        
        return JsonResponse({
            "ai_enabled": overall_ai_enabled,
            "total_products_analyzed": products_with_sufficient_data,
            "total_products_in_database": products.count(),
            "product_predictions": product_predictions
        })
        
    except Exception as e:
        return JsonResponse({
            "ai_enabled": False,
            "message": f"Prediction error: {str(e)}",
            "total_products_analyzed": 0,
            "product_predictions": []
        }, status=500)