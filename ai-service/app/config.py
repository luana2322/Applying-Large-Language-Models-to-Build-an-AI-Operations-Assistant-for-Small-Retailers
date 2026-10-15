import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    app_name: str = "Retail Operations Assistant AI Service"
    version: str = "1.0.0"
    internal_auth_token: str = os.getenv("INTERNAL_AUTH_TOKEN", "retail-internal-secret-token-v1")
    business_api_base_url: str = os.getenv("BUSINESS_API_BASE_URL", "http://localhost:8080/internal/api/v1/business")
    
    # LLM Settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini") # gemini | openai | mock
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Tool Execution Loop Guardrails
    max_tool_calls_per_req: int = int(os.getenv("MAX_TOOL_CALLS_PER_REQ", "5"))
    max_turns_per_req: int = int(os.getenv("MAX_TURNS_PER_REQ", "3"))
    tool_timeout_seconds: float = float(os.getenv("TOOL_TIMEOUT_SECONDS", "10.0"))
    llm_timeout_seconds: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "30.0"))
    request_timeout_seconds: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "30.0"))

    # Safety: cap stored/logged tool result payload size (characters)
    max_tool_result_chars: int = int(os.getenv("MAX_TOOL_RESULT_CHARS", "20000"))

settings = Settings()
