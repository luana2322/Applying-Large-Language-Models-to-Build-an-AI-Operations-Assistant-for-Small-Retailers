import pytest
from app.config import settings
from app.tools.restock_tools import init_all_tools

@pytest.fixture(autouse=True)
def default_test_environment(monkeypatch):
    monkeypatch.setattr(settings, "llm_provider", "mock")
    init_all_tools()

