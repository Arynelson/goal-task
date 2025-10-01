from datetime import date
from anyio import to_thread
from .prompt_builder import build_prompt
from .schemas import GenerateGoalPayload, Plan
from .gemini_client import GeminiClient
from .plan_repository import PlanRepository

class GoalBreakdownService:
    def __init__(self, gemini: GeminiClient, repository: PlanRepository):
        self._gemini = gemini
        self._repository = repository

    async def generate(self, payload: GenerateGoalPayload) -> tuple[int, int]:
        days_until_target = (payload.targetDate - date.today()).days
        if days_until_target <= 0:
            raise ValueError("Target date must be in the future")

        prompt = build_prompt(payload.goal, payload.targetDate, days_until_target, payload.language)
        raw_plan = await self._gemini.generate_plan(prompt)  # string JSON
        plan = Plan.model_validate_json(raw_plan)

        user_id = await to_thread.run_sync(self._repository.get_goal_owner, payload.goalId)
        return await to_thread.run_sync(self._repository.persist_plan, payload.goalId, user_id, plan)
