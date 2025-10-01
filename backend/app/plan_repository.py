from supabase.client import create_client, Client
from .config import get_settings
from .schemas import Plan

class PlanRepository:
    def __init__(self, client: Client | None = None):
        settings = get_settings()
        self._client = client or create_client(settings.supabase_url, settings.supabase_service_key)

    def get_goal_owner(self, goal_id: str) -> str:
        resp = self._client.table("goals").select("user_id").eq("id", goal_id).single().execute()
        if not resp.data:
            raise ValueError("Goal not found")
        return resp.data["user_id"]

    def persist_plan(self, goal_id: str, user_id: str, plan: Plan) -> tuple[int, int]:
        payload = {
            "goal_id": goal_id,
            "user_id": user_id,
            "milestones": [m.model_dump(by_alias=True) for m in plan.milestones],
            "tasks": [t.model_dump(by_alias=True) for t in plan.tasks],
        }
        result = self._client.rpc("persist_generated_plan", payload).execute()
        return result.data["milestones_inserted"], result.data["tasks_inserted"]
