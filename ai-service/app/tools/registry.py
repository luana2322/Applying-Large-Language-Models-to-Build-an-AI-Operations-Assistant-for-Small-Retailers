from typing import Dict, Any, List, Optional, Callable, Awaitable
from pydantic import BaseModel
import re

class ToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = False
    enum: Optional[List[str]] = None
    default: Optional[Any] = None

class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    required_params: List[str] = []

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(self, tool: ToolDefinition):
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    def to_gemini_declarations(self) -> List[Dict[str, Any]]:
        declarations = []
        for t in self._tools.values():
            declarations.append({
                "name": t.name,
                "description": t.description,
                "parameters": {
                    "type": "OBJECT",
                    "properties": t.parameters,
                    "required": t.required_params
                }
            })
        return declarations

    def to_openai_schemas(self) -> List[Dict[str, Any]]:
        schemas = []
        for t in self._tools.values():
            schemas.append({
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": {
                        "type": "object",
                        "properties": t.parameters,
                        "required": t.required_params
                    }
                }
            })
        return schemas

    def validate_arguments(self, name: str, args: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        tool = self.get_tool(name)
        if not tool:
            return False, f"Tool '{name}' không tồn tại trong Registry."

        # Check required
        for req in tool.required_params:
            if req not in args or args[req] is None:
                return False, f"Thiếu tham số bắt buộc '{req}' cho tool '{name}'."

        # Date format validation if date parameter present
        date_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
        for key in ["start_date", "end_date"]:
            if key in args and args[key]:
                if not isinstance(args[key], str) or not date_pattern.match(args[key]):
                    return False, f"Tham số '{key}' phải có định dạng ngày chuẩn YYYY-MM-DD."

        return True, None

# Singleton Registry
registry = ToolRegistry()
