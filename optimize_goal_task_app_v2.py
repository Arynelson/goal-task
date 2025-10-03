"""
Workflow para otimizar o aplicativo Goal Task Manager
VERSÃO COM RETRY AUTOMÁTICO E RATE LIMIT HANDLING
"""

import sys
sys.path.append('G:/claude')

# Importar a versão com retry
from workflow_autogen_with_retry import SimpleWorkflow

def main():
    # Inicializar com retry e delay configurados
    workflow = SimpleWorkflow(
        retry_attempts=3,        # 3 tentativas em caso de rate limit
        delay_between_phases=15  # 15 segundos entre cada fase
    )

    user_request = """
    Analisar e otimizar o aplicativo Goal Task Manager (React + TypeScript + Vite + Supabase).

    CONTEXTO DA APLICAÇÃO:
    - Aplicativo de gerenciamento de metas e tarefas
    - Stack: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
    - Backend: Supabase (Auth + PostgreSQL)
    - Integração com Gemini AI para sugestões de quebra de metas
    - Sistema de gamificação (streaks, níveis, progresso)
    - Suporte a i18n (Português/Inglês)
    - Dark mode implementado

    ÁREAS PARA ANÁLISE E OTIMIZAÇÃO:

    1. PERFORMANCE REACT (architect + developer):
       - Identificar re-renders desnecessários
       - Implementar React.memo, useMemo, useCallback onde necessário
       - Revisar estrutura de componentes (separar lógica e UI)
       - Otimizar queries do Supabase (usar React Query para cache)
       - Implementar lazy loading de rotas e componentes pesados
       - Revisar dependências de useEffect
       - Implementar virtualization em listas longas (se aplicável)

    2. CÓDIGO E ARQUITETURA (architect):
       - Revisar estrutura de pastas e organização
       - Identificar código duplicado e oportunidades de refatoração
       - Sugerir patterns para melhor manutenibilidade
       - Revisar tipos TypeScript (evitar 'any', melhorar inferência)
       - Separar lógica de negócio em hooks customizados
       - Implementar error boundaries
       - Melhorar tratamento de erros e loading states

    3. SUPABASE E DATABASE (developer + architect):
       - Revisar queries e otimizar com índices (se necessário)
       - Implementar paginação nas listagens
       - Revisar RLS (Row Level Security) policies
       - Otimizar fetching (usar select específico, evitar over-fetching)
       - Implementar cache estratégico
       - Revisar estrutura de tabelas (normalização)

    4. SEGURANÇA (security_auditor):
       - Revisar autenticação e autorização
       - Verificar exposição de dados sensíveis (env vars, API keys)
       - Analisar XSS, CSRF e outras vulnerabilidades
       - Revisar validações de input
       - Verificar sanitização de dados
       - Analisar cookies e localStorage (tokens, dados sensíveis)

    5. UI/UX E ACESSIBILIDADE (developer):
       - Verificar acessibilidade (ARIA labels, keyboard navigation)
       - Melhorar feedback visual (loading, errors, success)
       - Otimizar mobile responsiveness
       - Revisar contraste de cores (WCAG)
       - Implementar skeleton loaders
       - Melhorar mensagens de erro para o usuário

    6. BUNDLE SIZE E BUILD (architect):
       - Analisar tamanho do bundle
       - Identificar dependências pesadas e alternativas
       - Implementar code splitting
       - Revisar imports (tree-shaking)
       - Otimizar assets (imagens, fonts)
       - Configurar compression (gzip/brotli)

    7. TESTES (qa_engineer):
       - Revisar cobertura de testes atual
       - Identificar áreas críticas sem testes
       - Sugerir testes de integração importantes
       - Melhorar os testes existentes (Dashboard.test.tsx)
       - Adicionar testes E2E se necessário

    8. MELHORIAS GERAIS (architect + developer):
       - Implementar PWA (Service Worker, manifest)
       - Adicionar analytics e monitoramento de erros
       - Implementar feature flags
       - Melhorar sistema de notificações
       - Otimizar estratégia de cache
       - Revisar SEO (meta tags, Open Graph)

    ESTRUTURA ATUAL:
    ```
    src/
    ├── components/     # Componentes UI
    ├── hooks/          # Custom hooks (useAuth, useLanguage, etc)
    ├── pages/          # Páginas principais (Dashboard, Auth, Goals, etc)
    ├── integrations/   # Supabase client
    ├── lib/            # Utilities
    └── tests/          # Testes (recém implementado)
    ```

    ENTREGÁVEIS ESPERADOS:

    1. **Relatório de Análise**: Documento detalhado com problemas encontrados
    2. **Plano de Otimização Priorizado**: Lista ordenada de melhorias por impacto
    3. **Implementação de Melhorias**: Refatorações críticas
    4. **Documentação**: Guia de boas práticas

    PRIORIDADES:
    1. Segurança (crítico)
    2. Performance (alto)
    3. Bugs e estabilidade (alto)
    4. UX e acessibilidade (médio)
    5. Code quality (médio)
    """

    print("\n" + "="*80)
    print("EXECUTANDO WORKFLOW DE OTIMIZAÇÃO - GOAL TASK MANAGER")
    print("COM RETRY AUTOMÁTICO E RATE LIMIT HANDLING")
    print("="*80 + "\n")

    # Executar workflow completo com retry automático
    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Workflow de otimização executado com sucesso!")
        print(f"Resultados salvos em: outputs/")
        print("\nPróximos passos:")
        print("1. Revisar relatório de análise")
        print("2. Implementar melhorias priorizadas")
        print("3. Testar alterações")
        print("4. Medir impacto das otimizações")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
