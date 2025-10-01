# Backend FastAPI - Goal Task

## Configuração

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
SUPABASE_URL="https://ulimvxqcynzvuokwsxld.supabase.co"
SUPABASE_SERVICE_KEY="sua_service_role_key"
GEMINI_API_KEY="sua_gemini_api_key"
```

**Como obter as chaves:**

- **SUPABASE_SERVICE_KEY**: No painel do Supabase → Settings → API → `service_role` key (secret)
- **GEMINI_API_KEY**: No Google AI Studio (https://makersuite.google.com/app/apikey)

### 3. Executar o backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em: `http://localhost:8000`

### 4. Atualizar Edge Function no Supabase

A Edge Function já foi modificada para usar o backend Python como proxy.

Configure a variável de ambiente `FASTAPI_BACKEND_URL` no Supabase:

```bash
# Se estiver rodando localmente
FASTAPI_BACKEND_URL=http://localhost:8000

# Se estiver em produção (deploy do backend)
FASTAPI_BACKEND_URL=https://seu-backend-em-producao.com
```

**Para configurar no Supabase CLI:**

```bash
supabase secrets set FASTAPI_BACKEND_URL=http://localhost:8000
```

## Estrutura

```
backend/
├── app/
│   ├── main.py              # Endpoints FastAPI
│   ├── config.py            # Configurações e variáveis de ambiente
│   ├── schemas.py           # Modelos Pydantic
│   ├── service.py           # Lógica de negócio
│   ├── gemini_client.py     # Cliente para Gemini API
│   ├── plan_repository.py   # Acesso ao Supabase
│   └── prompt_builder.py    # Construção de prompts
└── requirements.txt
```

## Endpoints

### POST `/api/generate-goal-breakdown`

Gera tarefas e marcos para uma meta usando Gemini AI.

**Request:**
```json
{
  "goalId": "uuid",
  "goal": {
    "title": "Aprender Python",
    "description": "Descrição opcional",
    "importance_level": 4,
    "effort_estimated": 3
  },
  "targetDate": "2025-12-31",
  "language": "pt"
}
```

**Response:**
```json
{
  "success": true,
  "milestonesCount": 4,
  "tasksCount": 15
}
```

## Desenvolvimento

Para fazer o backend funcionar com o frontend:

1. Certifique-se de que o backend está rodando em `http://localhost:8000`
2. A Edge Function do Supabase faz proxy para o backend
3. O frontend chama a Edge Function normalmente

## Deploy

Para produção, você pode fazer deploy do backend em:

- **Railway**: https://railway.app/
- **Render**: https://render.com/
- **Fly.io**: https://fly.io/
- **Google Cloud Run**: https://cloud.google.com/run

Depois, atualize a variável `FASTAPI_BACKEND_URL` na Edge Function do Supabase.
