"""
Workflow 1: ANÁLISE E AUDITORIA DE SEGURANÇA
Goal Task Manager - Security Audit
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
    ANÁLISE DE SEGURANÇA - GOAL TASK MANAGER

    CONTEXTO:
    Aplicativo React + TypeScript + Vite + Supabase para gerenciamento de metas e tarefas.
    Sistema com autenticação, dados sensíveis de usuários, integração com APIs externas.

    OBJETIVO:
    Realizar auditoria completa de segurança, identificar vulnerabilidades e propor correções.

    ÁREAS DE ANÁLISE:

    1. AUTENTICAÇÃO E AUTORIZAÇÃO (security_auditor):
       - Revisar implementação do Supabase Auth
       - Verificar fluxo de login/logout
       - Analisar armazenamento de tokens (localStorage vs cookies)
       - Verificar renovação de tokens
       - Revisar proteção de rotas privadas
       - Verificar session management
       - Analisar política de senhas

    2. PROTEÇÃO DE DADOS SENSÍVEIS (security_auditor):
       - Verificar .env e variáveis de ambiente
       - Checar exposição de API keys (Supabase, Gemini AI)
       - Analisar dados em localStorage/sessionStorage
       - Verificar logs (não devem conter dados sensíveis)
       - Revisar headers de segurança
       - Verificar HTTPS enforcement

    3. VALIDAÇÃO E SANITIZAÇÃO (developer + security_auditor):
       - Revisar validação de inputs (formulários)
       - Verificar sanitização de dados do usuário
       - Analisar queries SQL (RLS do Supabase)
       - Verificar proteção contra SQL Injection
       - Revisar validação no backend (Supabase Functions)
       - Checar type safety (TypeScript)

    4. VULNERABILIDADES WEB (security_auditor):
       - XSS (Cross-Site Scripting)
         * Verificar uso de dangerouslySetInnerHTML
         * Analisar renderização de conteúdo de usuário
         * Revisar sanitização de HTML
       - CSRF (Cross-Site Request Forgery)
         * Verificar tokens CSRF
         * Analisar proteção em requests críticos
       - Clickjacking
         * Verificar headers X-Frame-Options
         * Revisar Content-Security-Policy

    5. SEGURANÇA DO SUPABASE (architect + security_auditor):
       - Revisar Row Level Security (RLS) policies
       - Verificar permissões de tabelas
       - Analisar políticas de acesso
       - Verificar isolamento entre usuários
       - Revisar triggers e functions
       - Checar backup e recovery

    6. DEPENDÊNCIAS E SUPPLY CHAIN (security_auditor):
       - Analisar dependências npm (vulnerabilidades conhecidas)
       - Verificar versões desatualizadas
       - Revisar dependências diretas e transitivas
       - Sugerir atualizações de segurança
       - Verificar integridade de pacotes

    7. SEGURANÇA DA API GEMINI (developer + security_auditor):
       - Verificar proteção da API key
       - Analisar rate limiting
       - Revisar sanitização de prompts
       - Verificar tratamento de respostas
       - Analisar exposição de dados na API

    ESTRUTURA DO PROJETO:
    ```
    src/
    ├── hooks/
    │   └── useAuth.ts          # Lógica de autenticação
    ├── integrations/
    │   └── supabase/
    │       └── client.ts       # Cliente Supabase
    ├── pages/
    │   ├── Auth.tsx            # Login/Cadastro
    │   ├── Dashboard.tsx       # Dashboard protegido
    │   └── Profile.tsx         # Perfil do usuário
    └── lib/
        └── gemini.ts           # Integração Gemini AI
    ```

    ENTREGÁVEIS:

    1. **Relatório de Vulnerabilidades**:
       - Lista completa de vulnerabilidades encontradas
       - Classificação por severidade (CRÍTICA/ALTA/MÉDIA/BAIXA)
       - CVSS score quando aplicável
       - Exploitabilidade e impacto

    2. **Plano de Correção Priorizado**:
       - Vulnerabilidades críticas (correção imediata)
       - Vulnerabilidades altas (correção em 7 dias)
       - Vulnerabilidades médias/baixas (backlog)

    3. **Código de Correção**:
       - Implementações de segurança
       - Patches para vulnerabilidades críticas
       - Exemplos de código seguro

    4. **Checklist de Segurança**:
       - Lista de verificação para futuras features
       - Boas práticas de segurança
       - Guidelines para o time

    5. **Documentação de Segurança**:
       - Políticas de segurança
       - Procedimentos de incident response
       - Security headers recomendados

    PRIORIDADE: CRÍTICA
    Segurança é fundamental para proteger dados dos usuários.
    """

    print("\n" + "="*80)
    print("WORKFLOW 1: ANÁLISE E AUDITORIA DE SEGURANÇA")
    print("Goal Task Manager - Security Audit")
    print("="*80 + "\n")

    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Auditoria de segurança concluída!")
        print(f"Resultados salvos em: outputs/")
        print("\n⚠️  PRÓXIMOS PASSOS:")
        print("1. Revisar vulnerabilidades CRÍTICAS e ALTAS")
        print("2. Aplicar correções imediatas")
        print("3. Testar patches de segurança")
        print("4. Implementar checklist de segurança")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
