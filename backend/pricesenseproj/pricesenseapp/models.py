from django.db import models


class Product(models.Model):

    name = models.CharField(max_length=255)

    current_price = models.FloatField(default=0)

    def __str__(self):
        return self.name


class SalesRecord(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    sale_date = models.DateField()

    price = models.FloatField()

    quantity_sold = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} - {self.sale_date}"