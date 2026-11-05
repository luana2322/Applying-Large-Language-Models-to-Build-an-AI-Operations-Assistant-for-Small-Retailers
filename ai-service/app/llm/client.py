from app.config import settings
from app.llm.provider_adapter import BaseLLMAdapter, MockLLMAdapter, GeminiLLMAdapter, OpenAILLMAdapter
import logging

logger = logging.getLogger(__name__)

def get_llm_adapter() -> BaseLLMAdapter:
    provider = settings.llm_provider.lower().strip()
    if provider == "ollama":
        logger.info(f"Using Ollama Local LLM Provider ({settings.ollama_model} at {settings.ollama_base_url})")
        return OpenAILLMAdapter(
            api_key="ollama",
            model_name=settings.ollama_model,
            base_url=settings.ollama_base_url
        )
    if provider == "gemini" and settings.gemini_api_key:
        logger.info(f"Using Gemini LLM Provider ({settings.gemini_model})")
        return GeminiLLMAdapter(api_key=settings.gemini_api_key, model_name=settings.gemini_model)
    if provider == "openai" and settings.openai_api_key:
        logger.info(f"Using OpenAI LLM Provider ({settings.openai_model})")
        return OpenAILLMAdapter(api_key=settings.openai_api_key, model_name=settings.openai_model)
    if provider in ("gemini", "openai", "ollama"):
        logger.warning(f"LLM_PROVIDER='{provider}' fallback to mock.")
    logger.info("Using deterministic Mock LLM Provider (offline mode)")
    return MockLLMAdapter()
