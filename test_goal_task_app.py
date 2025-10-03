"""
Workflow para testar o aplicativo Goal Task Manager
Testa os principais fluxos: autenticação, criação de metas, tarefas e dashboard
"""

import sys
sys.path.append('G:/claude')

from workflow_autogen import SimpleWorkflow

def main():
    workflow = SimpleWorkflow()

    user_request = """
    Testar o aplicativo Goal Task Manager (React + TypeScript + Vite + Supabase).

    CONTEXTO:
    - Aplicativo de gerenciamento de metas e tarefas
    - Usa Supabase para auth e database
    - Frontend React com TypeScript
    - UI com Tailwind CSS e shadcn/ui
    - Integração com Gemini AI para quebra de metas

    TESTES PRINCIPAIS A REALIZAR:

    1. AUTENTICAÇÃO (src/pages/Auth.tsx):
       - Verificar se formulário de login/cadastro renderiza corretamente
       - Testar validação de campos (email, senha, nome)
       - Verificar integração com Supabase auth
       - Testar redirecionamento após login

    2. DASHBOARD (src/pages/Dashboard.tsx):
       - Verificar se estatísticas são calculadas corretamente
       - Testar exibição de progresso de metas
       - Verificar cálculo de streak atual
       - Testar consistência semanal

    3. GERENCIAMENTO DE METAS (src/pages/Goals.tsx):
       - Testar criação de nova meta
       - Verificar edição de meta existente
       - Testar exclusão de meta
       - Verificar filtros (todas/ativas/completas)
       - Testar integração com Gemini AI para quebra de metas

    4. GERENCIAMENTO DE TAREFAS:
       - Testar criação de tarefa vinculada a meta
       - Verificar conclusão de tarefa
       - Testar edição de tarefa
       - Verificar exclusão de tarefa
       - Testar prioridades e datas

    5. INTEGRAÇÃO SUPABASE (src/lib/supabase.ts):
       - Verificar conexão com banco de dados
       - Testar queries principais
       - Verificar tratamento de erros

    6. HOOKS CUSTOMIZADOS:
       - Testar useAuth (src/hooks/useAuth.ts)
       - Testar useGoals (src/hooks/useGoals.ts)
       - Testar useTasks (src/hooks/useTasks.ts)

    REQUISITOS:
    - Criar testes unitários com Jest/Vitest
    - Criar testes de integração onde apropriado
    - Usar Testing Library para componentes React
    - Mockar chamadas Supabase e Gemini API
    - Gerar relatório de cobertura
    - Documentar setup de testes no README

    ENTREGÁVEIS:
    - Arquivos de teste organizados em __tests__/
    - Configuração de teste (vitest.config.ts ou jest.config.js)
    - Mocks para Supabase e APIs externas
    - Scripts npm para rodar testes
    - Documentação de como executar testes
    """

    print("\n" + "="*80)
    print("EXECUTANDO WORKFLOW DE TESTES - GOAL TASK MANAGER")
    print("="*80 + "\n")

    # Executar workflow completo
    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Workflow de testes executado com sucesso!")
        print(f"Resultados salvos em: outputs/")
        print("\nPróximos passos:")
        print("1. Revisar os testes criados")
        print("2. Executar: npm test")
        print("3. Verificar cobertura: npm run test:coverage")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
