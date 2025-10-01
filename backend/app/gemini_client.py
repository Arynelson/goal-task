import asyncio, time, re, json
from collections.abc import Sequence
import httpx
from .config import get_settings

class GeminiClient:
    def __init__(self, http: httpx.AsyncClient):
        self._http = http
        self._settings = get_settings()
        self._cached_models: tuple[list[str], float] | None = None
        self._lock = asyncio.Lock()

    async def _list_models(self) -> Sequence[str]:
        async with self._lock:
            if self._cached_models and time.monotonic() - self._cached_models[1] < self._settings.model_cache_ttl:
                return list(self._cached_models[0])

            resp = await self._http.get(
                "https://generativelanguage.googleapis.com/v1/models",
                params={"key": self._settings.gemini_api_key},
                timeout=self._settings.gemini_request_timeout,
            )
            resp.raise_for_status()
            models = [
                m["name"].removeprefix("models/")
                for m in resp.json().get("models", [])
                if "generateContent" in m.get("supportedGenerationMethods", [])
            ]
            self._cached_models = (models, time.monotonic())
            return models

    async def generate_plan(self, prompt: str) -> str:
        models = await self._list_models()
        candidates = [
            self._settings.gemini_default_model,
            *(models[:3] or ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-pro"]),
        ]

        for model in dict.fromkeys(candidates):
            try:
                resp = await self._http.post(
                    f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent",
                    params={"key": self._settings.gemini_api_key},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7, "topK": 40, "topP": 0.95, "maxOutputTokens": 2048
                        },
                    },
                    timeout=self._settings.gemini_request_timeout,
                )
                resp.raise_for_status()
                payload = resp.json()
                text = payload["candidates"][0]["content"]["parts"][0]["text"]
                # limpa cercas de código e extrai só o JSON
                text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE)
                m = re.search(r"\{[\s\S]*\}", text)
                return m.group(0) if m else text
            except (httpx.TimeoutException, httpx.HTTPStatusError, KeyError, IndexError, TypeError):
                continue
        raise RuntimeError("Failed to generate plan with Gemini")
