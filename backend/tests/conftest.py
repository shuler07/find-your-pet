import os
import sys
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


os.environ.setdefault(
    "URL_DATABASE", "postgresql+asyncpg://test:test@localhost:5432/test"
)
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("SMTP_HOST", "smtp.example.com")
os.environ.setdefault("SMTP_PORT", "587")
os.environ.setdefault("SMTP_USER", "test@example.com")
os.environ.setdefault("SMTP_PASSWORD", "test-password")
os.environ.setdefault("EMAIL_FROM", "test@example.com")
os.environ.setdefault("APP_URL", "http://localhost")


@pytest.fixture
def make_request_with_cookies():
    from starlette.requests import Request

    def _make(cookies: dict):
        cookie_header = "; ".join([f"{k}={v}" for k, v in cookies.items()])
        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "path": "/",
            "raw_path": b"/",
            "query_string": b"",
            "headers": [(b"cookie", cookie_header.encode("utf-8"))],
        }
        return Request(scope)

    return _make
