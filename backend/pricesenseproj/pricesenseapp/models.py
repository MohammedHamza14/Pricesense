from django.db import models


# 1. Product MUST be defined first
class Product(models.Model):
    name = models.CharField(max_length=200)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# 2. SalesRecord comes second
class SalesRecord(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    sale_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_sold = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} - {self.sale_date}"