import os
import sys

# Add the backend pricesenseproj directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'pricesenseproj'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricesenseproj.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
