from .base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", default="http://localhost:3000"
).split(",")

CORS_ALLOW_CREDENTIALS = True

# Use SQLite in dev if no DB env vars are set
from decouple import config as _config

if not _config("DB_NAME", default=""):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Log emails to console in dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
