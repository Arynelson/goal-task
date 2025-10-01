from functools import lru_cache
from pydantic import HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: HttpUrl
    supabase_service_key: str
    gemini_api_key: str
    gemini_default_model: str = "gemini-1.5-flash"
    gemini_request_timeout: float = 20.0
    model_cache_ttl: int = 300  # segundos

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()
