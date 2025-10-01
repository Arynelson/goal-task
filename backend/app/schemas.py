from datetime import date
from typing import Literal, Optional, Sequence
from pydantic import BaseModel, Field, ConfigDict, field_validator

SupportedLanguage = Literal["pt", "en"]

class GoalPayload(BaseModel):
    title: str
    description: Optional[str] = None
    importance_level: int = Field(ge=1, le=5)
    effort_estimated: int = Field(ge=1, le=5)

class GenerateGoalPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    goalId: str = Field(alias="goalId")
    goal: GoalPayload
    targetDate: date = Field(alias="targetDate")
    language: SupportedLanguage = "pt"

class Milestone(BaseModel):
    title: str
    description: str
    order_sequence: int = Field(alias="order_sequence")

class Task(BaseModel):
    title: str
    description: str
    priority: str
    estimated_duration: int
    due_date: date = Field(alias="due_date")
    prerequisites: Sequence[str] | None = None
    order_sequence: int = Field(alias="order_sequence")

    @field_validator("priority", mode="before")
    @classmethod
    def _normalize_priority(cls, v: str) -> str:
        p = (v or "media").lower()
        return p if p in {"alta", "media", "baixa"} else "media"

class Plan(BaseModel):
    milestones: list[Milestone] = []
    tasks: list[Task] = []
