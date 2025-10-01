from fastapi import FastAPI, HTTPException, Depends
import httpx
from .schemas import GenerateGoalPayload
from .service import GoalBreakdownService
from .gemini_client import GeminiClient
from .plan_repository import PlanRepository

app = FastAPI(title="Wise Quest Backend")

async def get_service() -> GoalBreakdownService:
    async with httpx.AsyncClient() as http_client:
        service = GoalBreakdownService(GeminiClient(http_client), PlanRepository())
        yield service

@app.post("/goals/{goal_id}/plan")
async def generate_plan(goal_id: str, body: GenerateGoalPayload, service: GoalBreakdownService = Depends(get_service)):
    try:
        if goal_id != body.goalId:
            raise ValueError("Payload goalId mismatch")
        milestones, tasks = await service.generate(body)
        return {"success": True, "milestonesCount": milestones, "tasksCount": tasks}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

# alias compatível com a Edge Function (sem quebrar frontend)
@app.post("/api/generate-goal-breakdown")
async def generate_goal_breakdown(body: GenerateGoalPayload, service: GoalBreakdownService = Depends(get_service)):
    try:
        milestones, tasks = await service.generate(body)
        return {"success": True, "milestonesCount": milestones, "tasksCount": tasks}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
