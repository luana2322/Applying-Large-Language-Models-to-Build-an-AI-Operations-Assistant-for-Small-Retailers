from app.config import settings
from app.llm.provider_adapter import BaseLLMAdapter, MockLLMAdapter, GeminiLLMAdapter, OpenAILLMAdapter, LLMResponse
from typing import List, Dict, Any
import logging
import time

logger = logging.getLogger(__name__)

class DualResilientLLMAdapter(BaseLLMAdapter):
    """
    Adapter kép thông minh:
    - Ưu tiên dùng Gemini API để có tốc độ phản hồi cực nhanh (< 1.5s) và Function Calling chuẩn xác.
    - Tự động fallback sang Ollama Local (qwen2.5 / retail-assistant) khi Gemini lỗi mạng hoặc hết hạn ngạch.
    - Tích hợp Circuit Breaker: khi Gemini lỗi, tạm dừng gọi Gemini 60s để tránh làm trễ mọi yêu cầu tiếp theo.
    """
    def __init__(self, gemini_adapter: GeminiLLMAdapter, fallback_adapter: BaseLLMAdapter):
        self.gemini_adapter = gemini_adapter
        self.fallback_adapter = fallback_adapter
        self._gemini_cooldown_until: float = 0.0

    async def generate(
        self,
        system_instruction: str,
        history: List[Dict[str, Any]],
        message: str,
        tool_declarations: List[Dict[str, Any]]
    ) -> LLMResponse:
        now = time.time()
        if self.gemini_adapter and self.gemini_adapter.api_key and now >= self._gemini_cooldown_until:
            try:
                logger.info("Attempting inference with Gemini API...")
                return await self.gemini_adapter.generate(system_instruction, history, message, tool_declarations)
            except Exception as e:
                self._gemini_cooldown_until = time.time() + 60.0
                logger.warning(f"Gemini API rate limit or error ({e}). Cooldown activated for 60s. Seamlessly falling back to local model/fallback...")
        return await self.fallback_adapter.generate(system_instruction, history, message, tool_declarations)


def get_llm_adapter() -> BaseLLMAdapter:
    provider = settings.llm_provider.lower().strip()

    if provider == "mock":
        logger.info("Using deterministic Mock LLM Provider (offline/test mode)")
        return MockLLMAdapter()

    # Chuẩn bị local/Ollama adapter
    local_adapter = OpenAILLMAdapter(
        api_key="ollama",
        model_name=settings.ollama_model,
        base_url=settings.ollama_base_url
    )

    if provider == "ollama":
        logger.info(f"Using Ollama Local LLM Provider ({settings.ollama_model} at {settings.ollama_base_url})")
        return local_adapter

    if provider == "gemini" and settings.gemini_api_key:
        logger.info(f"Using Gemini LLM Provider ({settings.gemini_model})")
        return GeminiLLMAdapter(api_key=settings.gemini_api_key, model_name=settings.gemini_model)

    if settings.gemini_api_key and provider in ("dual", "hybrid"):
        logger.info(f"Initializing DualResilientLLMAdapter with primary Gemini ({settings.gemini_model}) and fallback Ollama ({settings.ollama_model}).")
        gemini_adapter = GeminiLLMAdapter(api_key=settings.gemini_api_key, model_name=settings.gemini_model)
        return DualResilientLLMAdapter(gemini_adapter=gemini_adapter, fallback_adapter=local_adapter)

    if provider == "openai" and settings.openai_api_key:
        logger.info(f"Using OpenAI LLM Provider ({settings.openai_model})")
        return OpenAILLMAdapter(api_key=settings.openai_api_key, model_name=settings.openai_model)

    if settings.gemini_api_key:
        gemini_adapter = GeminiLLMAdapter(api_key=settings.gemini_api_key, model_name=settings.gemini_model)
        return DualResilientLLMAdapter(gemini_adapter=gemini_adapter, fallback_adapter=local_adapter)

    logger.info("Using deterministic Mock LLM Provider (offline mode)")
    return MockLLMAdapter()
