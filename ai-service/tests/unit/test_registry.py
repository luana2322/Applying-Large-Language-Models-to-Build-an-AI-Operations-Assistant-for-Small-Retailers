import pytest
from app.tools.registry import registry
from app.tools.restock_tools import init_all_tools

@pytest.fixture(autouse=True)
def setup_tools():
    init_all_tools()

def test_all_seven_tools_registered():
    tools = registry.list_tools()
    tool_names = [t.name for t in tools]
    expected = [
        "get_sales_summary",
        "get_profit_summary",
        "get_top_products",
        "get_inventory_status",
        "get_slow_moving_products",
        "get_expense_summary",
        "get_restock_suggestions"
    ]
    for exp in expected:
        assert exp in tool_names, f"Tool '{exp}' must be registered"

def test_argument_validation_for_dates():
    valid, err = registry.validate_arguments("get_sales_summary", {"start_date": "2026-10-01", "end_date": "2026-10-15"})
    assert valid is True
    assert err is None

    # Invalid date format
    valid_bad, err_bad = registry.validate_arguments("get_sales_summary", {"start_date": "15/10/2026"})
    assert valid_bad is False
    assert "định dạng ngày chuẩn YYYY-MM-DD" in err_bad

def test_unregistered_tool_rejection():
    valid, err = registry.validate_arguments("non_existent_tool", {})
    assert valid is False
    assert "không tồn tại trong Registry" in err
