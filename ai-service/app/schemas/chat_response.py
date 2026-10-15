from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ToolCallRecord(BaseModel):
    name: str
    arguments: Optional[Dict[str, Any]] = None
    status: str = "success" # success | error | rejected
    error: Optional[str] = None
    # Size-capped copy of the grounded tool result for audit/persistence.
    result: Optional[Any] = None

class ChatError(BaseModel):
    code: str
    message: str

class ChatResponse(BaseModel):
    request_id: str
    session_id: str
    status: str = "completed" # completed | needs_clarification | failed | partial
    answer: str
    intent: Optional[str] = "GENERAL_HELP"
    data: Optional[Dict[str, Any]] = None
    tool_calls: List[ToolCallRecord] = Field(default_factory=list)
    error: Optional[ChatError] = None
