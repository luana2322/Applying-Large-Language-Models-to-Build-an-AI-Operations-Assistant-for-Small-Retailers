from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class ChatContext(BaseModel):
    timezone: str = "Asia/Ho_Chi_Minh"
    locale: str = "vi-VN"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ChatRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    context: Optional[ChatContext] = Field(default_factory=ChatContext)
