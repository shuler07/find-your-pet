import importlib
import sys

import pytest


def test_config_requires_url_database(monkeypatch):
    monkeypatch.setenv("URL_DATABASE", "")
    sys.modules.pop("config", None)

    with pytest.raises(EnvironmentError):
        importlib.import_module("config")

    monkeypatch.setenv(
        "URL_DATABASE", "postgresql+asyncpg://test:test@localhost:5432/test"
    )
    sys.modules.pop("config", None)
    importlib.import_module("config")
