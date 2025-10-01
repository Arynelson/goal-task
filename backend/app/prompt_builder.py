from datetime import date
from .schemas import GoalPayload, SupportedLanguage

def build_prompt(goal: GoalPayload, target: date, days_until_target: int, language: SupportedLanguage) -> str:
    if language == "en":
        return f"""As a planning expert, break the goal below into daily tasks.

GOAL: {goal.title}
DESCRIPTION: {goal.description or 'No description'}
DEADLINE: {days_until_target} days (until {target.strftime('%m/%d/%Y')})
IMPORTANCE: {goal.importance_level}/5
ESTIMATED EFFORT: {goal.effort_estimated}/5

Rules:
- Balance tasks across {days_until_target} days.
- Each task MUST include due_date (yyyy-mm-dd) between today and the deadline.
- priority must be "alta" | "media" | "baixa" (keep PT labels).
- estimated_duration in minutes (> 0).
- Include milestones around 25/50/75/100%.

Respond ONLY with valid JSON:
{{
  "milestones": [{{"title":"Milestone 1 (25%)","description":"...","order_sequence":1}}],
  "tasks": [{{
    "title":"...","description":"...","priority":"alta|media|baixa",
    "estimated_duration":60,"due_date":"2025-12-01","prerequisites":["..."],"order_sequence":1
  }}]
}}
"""
    return f"""Como especialista em planejamento, quebre a meta abaixo em tarefas diárias.

META: {goal.title}
DESCRIÇÃO: {goal.description or 'Sem descrição'}
PRAZO: {days_until_target} dias (até {target.strftime('%d/%m/%Y')})
IMPORTÂNCIA: {goal.importance_level}/5
ESFORÇO ESTIMADO: {goal.effort_estimated}/5

Regras:
- Distribua o plano ao longo dos {days_until_target} dias.
- Toda tarefa DEVE ter due_date no formato yyyy-mm-dd entre hoje e o prazo.
- priority: "alta" | "media" | "baixa" (minúsculas, PT-BR).
- estimated_duration em minutos (> 0).
- Inclua marcos em ~25/50/75/100%.

Responda APENAS com JSON válido:
{{
  "milestones": [{{"title":"Marco 1 (25%)","description":"...","order_sequence":1}}],
  "tasks": [{{
    "title":"...","description":"...","priority":"alta|media|baixa",
    "estimated_duration":60,"due_date":"2025-12-01","prerequisites":["..."],"order_sequence":1
  }}]
}}
"""
