# Como Rodar os Testes do Goal Task

## Status dos Testes Gerados

✅ **Fase 4 - Testes Dashboard**: COMPLETO
✅ **Fase 8 - Testes Hooks**: COMPLETO
❌ **Outras fases**: Rate limit (429) - podem ser executadas depois

---

## Passo 1: Instalar Dependências de Teste

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/react-hooks jsdom
```

---

## Passo 2: Configurar Vitest

Crie o arquivo `vitest.config.ts` na raiz do projeto:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Passo 3: Criar Setup de Testes

Crie `src/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

## Passo 4: Adicionar Scripts no package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Passo 5: Extrair Testes dos Arquivos de Output

### 5.1 - Testes do Dashboard

Copie o conteúdo da fase 4 e crie `src/tests/Dashboard.test.tsx`:

```bash
# Copie manualmente do arquivo:
outputs/20251001_144453_plano_de_testes_goal_task_manager_fase_4.txt
```

**Nota**: O teste gerado assume props `stats`, mas o componente real usa hooks. Você precisará **mockar** `useAuth`, `useLanguage`, `useToast` e a integração com Supabase.

### 5.2 - Testes dos Hooks

Copie o conteúdo da fase 8 e crie:
- `src/tests/hooks/useAuth.test.tsx`
- `src/tests/hooks/useGoals.test.tsx`
- `src/tests/hooks/useTasks.test.tsx`

```bash
# Copie manualmente do arquivo:
outputs/20251001_144453_plano_de_testes_goal_task_manager_fase_8.txt
```

---

## Passo 6: Mockar Supabase

Crie `src/tests/mocks/supabase.ts`:

```typescript
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

---

## Passo 7: Rodar os Testes

```bash
# Rodar todos os testes
npm test

# Rodar com interface visual
npm run test:ui

# Rodar com cobertura
npm run test:coverage
```

---

## Estrutura Final de Pastas

```
src/
├── tests/
│   ├── setup.ts
│   ├── Dashboard.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.tsx
│   │   ├── useGoals.test.tsx
│   │   └── useTasks.test.tsx
│   └── mocks/
│       └── supabase.ts
```

---

## Limitações dos Testes Gerados

⚠️ **Importante**: Os testes foram gerados por IA e precisam de **adaptação**:

1. **Dashboard.test.tsx**: O teste assume que o componente recebe props `stats`, mas o componente real busca dados via hooks e Supabase
2. **Hooks tests**: Assumem estrutura de pastas diferente (`../api/auth`, etc.)
3. **Mocks**: Precisam ser ajustados para a estrutura real do projeto

---

## Solução para Rate Limit (429)

Para completar as outras fases (Auth, Goals, Tasks, Supabase, Security, Docs):

### Opção 1: Aguardar e Re-executar
```bash
# Aguardar 15-30 minutos e rodar novamente
python test_goal_task_app.py
```

### Opção 2: Executar Manualmente em Lotes
Criar workflow específico para cada fase com intervalo:

```python
# test_batch_1.py - Fases 1, 2, 3
# test_batch_2.py - Fases 5, 6, 7
# test_batch_3.py - Fases 9, 10
```

### Opção 3: Implementar Manualmente
Usar as fases 4 e 8 como base e criar os outros testes seguindo o mesmo padrão.

---

## Próximos Passos

1. ✅ Instalar dependências
2. ✅ Configurar Vitest
3. ⚠️ Adaptar testes gerados para estrutura real
4. 🔄 Mockar Supabase e hooks
5. ✅ Rodar testes
6. 📊 Verificar cobertura

---

## Dúvidas?

- Os testes gerados estão em: `outputs/20251001_144453_*`
- Apenas fases 4 e 8 foram bem-sucedidas
- As outras falharam por rate limit, mas podem ser re-executadas depois
