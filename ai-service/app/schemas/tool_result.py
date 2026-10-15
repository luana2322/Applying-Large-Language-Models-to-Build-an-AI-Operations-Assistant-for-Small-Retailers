from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ToolMetadata(BaseModel):
    store_id: Optional[str] = None
    generated_at: Optional[str] = None
    data_complete: bool = True

class ToolError(BaseModel):
    code: str
    message: str

class ToolResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    metadata: ToolMetadata = Field(default_factory=ToolMetadata)
    error: Optional[ToolError] = None
