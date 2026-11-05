from app.config import settings
from app.llm.provider_adapter import BaseLLMAdapter, MockLLMAdapter, GeminiLLMAdapter, OpenAILLMAdapter, LLMResponse
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class DualResilientLLMAdapter(BaseLLMAdapter):
    """
    Adapter kép thông minh:
    - Ưu tiên dùng Gemini API (gemini-3.8-flash) để có tốc độ phản hồi cực nhanh (< 1.5s) và Function Calling chuẩn xác.
    - Tự động fallback sang Ollama Local (qwen2.5:3b) khi Gemini hết hạn ngạch (429 Quota Exceeded) hoặc lỗi mạng.
    """
    def __init__(self, gemini_adapter: GeminiLLMAdapter, fallback_adapter: BaseLLMAdapter):
        self.gemini_adapter = gemini_adapter
        self.fallback_adapter = fallback_adapter

    async def generate(
        self,
        system_instruction: str,
        history: List[Dict[str, Any]],
        message: str,
        tool_declarations: List[Dict[str, Any]]
    ) -> LLMResponse:
        if self.gemini_adapter and self.gemini_adapter.api_key:
            try:
                logger.info("Attempting inference with Gemini API...")
                return await self.gemini_adapter.generate(system_instruction, history, message, tool_declarations)
            except Exception as e:
                logger.warning(f"Gemini API rate limit or error ({e}). Seamlessly falling back to local model/fallback...")
        return await self.fallback_adapter.generate(system_instruction, history, message, tool_declarations)


def get_llm_adapter() -> BaseLLMAdapter:
    provider = settings.llm_provider.lower().strip()
    
    # Chuẩn bị local/Ollama adapter
    local_adapter = OpenAILLMAdapter(
        api_key="ollama",
        model_name=settings.ollama_model,
        base_url=settings.ollama_base_url
    )

    # Nếu có cấu hình Gemini API Key
    if settings.gemini_api_key:
        logger.info(f"Gemini API Key configured. Initializing DualResilientLLMAdapter with primary Gemini ({settings.gemini_model}) and fallback Ollama ({settings.ollama_model}).")
        gemini_adapter = GeminiLLMAdapter(api_key=settings.gemini_api_key, model_name=settings.gemini_model)
        return DualResilientLLMAdapter(gemini_adapter=gemini_adapter, fallback_adapter=local_adapter)

    if provider == "ollama":
        logger.info(f"Using Ollama Local LLM Provider ({settings.ollama_model} at {settings.ollama_base_url})")
        return local_adapter

    if provider == "openai" and settings.openai_api_key:
        logger.info(f"Using OpenAI LLM Provider ({settings.openai_model})")
        return OpenAILLMAdapter(api_key=settings.openai_api_key, model_name=settings.openai_model)

    logger.info("Using deterministic Mock LLM Provider (offline mode)")
    return MockLLMAdapter()
