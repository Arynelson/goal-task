"""
Workflow 2: QUALIDADE DE CÓDIGO E ARQUITETURA
Goal Task Manager - Code Quality & Architecture
"""

import sys
sys.path.append('G:/claude')

from workflow_autogen_with_retry import SimpleWorkflow

def main():
    workflow = SimpleWorkflow(
        retry_attempts=3,
        delay_between_phases=15
    )

    user_request = """
    ANÁLISE DE CÓDIGO E ARQUITETURA - GOAL TASK MANAGER

    CONTEXTO:
    Aplicativo React + TypeScript com foco em manutenibilidade e escalabilidade.

    OBJETIVO:
    Melhorar qualidade do código, arquitetura e manutenibilidade do projeto.

    ÁREAS DE ANÁLISE:

    1. ARQUITETURA E ESTRUTURA (architect):
       - Revisar organização de pastas
       - Analisar separação de responsabilidades
       - Verificar camadas (UI, lógica, dados)
       - Sugerir patterns (Repository, Service, etc)
       - Avaliar escalabilidade da arquitetura
       - Revisar estrutura de módulos

    2. QUALIDADE DO TYPESCRIPT (architect + developer):
       - Eliminar uso de 'any'
       - Melhorar inferência de tipos
       - Criar interfaces e types reutilizáveis
       - Revisar generics
       - Implementar utility types
       - Verificar strict mode

    3. COMPONENTES REACT (developer):
       - Identificar componentes muito grandes
       - Separar lógica de apresentação
       - Criar componentes atômicos/moleculares
       - Revisar props drilling
       - Implementar composition over inheritance
       - Melhorar reusabilidade

    4. HOOKS CUSTOMIZADOS (developer):
       - Revisar hooks existentes (useAuth, useGoals, useTasks)
       - Identificar lógica duplicada
       - Criar novos hooks para abstrair lógica
       - Otimizar dependências
       - Implementar error handling
       - Adicionar tipos corretos

    5. GERENCIAMENTO DE ESTADO (architect):
       - Avaliar estratégia atual (Context API)
       - Verificar se precisa de Redux/Zustand
       - Revisar performance do Context
       - Otimizar re-renders
       - Implementar state normalization
       - Separar estados globais e locais

    6. CÓDIGO DUPLICADO (code_reviewer):
       - Identificar código repetido
       - Criar funções/componentes reutilizáveis
       - Implementar DRY (Don't Repeat Yourself)
       - Criar utilities compartilhados
       - Refatorar lógica duplicada

    7. ERROR HANDLING (developer):
       - Implementar Error Boundaries
       - Melhorar tratamento de erros assíncronos
       - Criar error messages consistentes
       - Implementar logging estruturado
       - Adicionar fallbacks

    8. TESTES E TESTABILIDADE (qa_engineer):
       - Revisar código testável
       - Identificar dependências difíceis de mockar
       - Separar side effects
       - Implementar injeção de dependência
       - Melhorar cobertura de testes

    9. DOCUMENTAÇÃO DE CÓDIGO (doc_writer):
       - Adicionar JSDoc em funções complexas
       - Documentar interfaces e types
       - Criar README técnico
       - Documentar decisões arquiteturais
       - Adicionar exemplos de uso

    ESTRUTURA ATUAL:
    ```
    src/
    ├── components/
    │   ├── ui/             # shadcn components
    │   ├── GoalForm.tsx
    │   └── Layout.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useGoals.ts
    │   └── useLanguage.ts
    ├── pages/
    │   ├── Auth.tsx
    │   ├── Dashboard.tsx
    │   ├── Goals.tsx
    │   └── Profile.tsx
    └── lib/
        └── utils.ts
    ```

    ENTREGÁVEIS:

    1. **Relatório de Code Smells**:
       - Lista de problemas identificados
       - Categorização (crítico/alto/médio/baixo)
       - Métricas de complexidade
       - Sugestões de refatoração

    2. **Plano de Refatoração**:
       - Priorização de melhorias
       - Estimativa de esforço
       - Roadmap de implementação
       - Quick wins (impacto alto, esforço baixo)

    3. **Código Refatorado**:
       - Exemplos de código melhorado
       - Novos hooks customizados
       - Componentes otimizados
       - Utilities criados

    4. **Guia de Arquitetura**:
       - Padrões a seguir
       - Estrutura de pastas recomendada
       - Convenções de código
       - Boas práticas React/TypeScript

    5. **Documentação Técnica**:
       - ADRs (Architecture Decision Records)
       - Diagramas de arquitetura
       - Guia de contribuição
       - Style guide

    FOCO: MANUTENIBILIDADE E ESCALABILIDADE
    Código limpo facilita evolução e reduz bugs.
    """

    print("\n" + "="*80)
    print("WORKFLOW 2: QUALIDADE DE CÓDIGO E ARQUITETURA")
    print("Goal Task Manager - Code Quality & Architecture")
    print("="*80 + "\n")

    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Análise de código concluída!")
        print(f"Resultados salvos em: outputs/")
        print("\n📋 PRÓXIMOS PASSOS:")
        print("1. Revisar code smells identificados")
        print("2. Implementar quick wins")
        print("3. Planejar refatorações maiores")
        print("4. Seguir guia de arquitetura")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
