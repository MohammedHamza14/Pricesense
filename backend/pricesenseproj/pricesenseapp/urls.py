from django.urls import path
from .views import upload_csv,dashboard

urlpatterns = [
    path("upload-csv/", upload_csv),
    path("dashboard/", dashboard),
]