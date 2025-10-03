"""
Workflow 3: UI/UX E ACESSIBILIDADE
Goal Task Manager - UI/UX & Accessibility
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
    ANÁLISE DE UI/UX E ACESSIBILIDADE - GOAL TASK MANAGER

    CONTEXTO:
    Aplicativo de produtividade que precisa ser intuitivo, acessível e agradável de usar.

    OBJETIVO:
    Melhorar experiência do usuário e garantir acessibilidade para todos.

    ÁREAS DE ANÁLISE:

    1. ACESSIBILIDADE (WCAG 2.1) (developer + qa_engineer):
       - Verificar contraste de cores (mínimo 4.5:1)
       - Testar navegação por teclado
       - Adicionar ARIA labels e roles
       - Verificar screen reader compatibility
       - Implementar skip links
       - Testar com ferramentas (axe, Lighthouse)
       - Garantir foco visível
       - Validar HTML semântico

    2. RESPONSIVIDADE (developer):
       - Testar em diferentes resoluções
       - Verificar breakpoints (mobile, tablet, desktop)
       - Otimizar touch targets (mínimo 44x44px)
       - Revisar layout mobile-first
       - Testar orientação (portrait/landscape)
       - Verificar overflow e scroll

    3. FEEDBACK VISUAL (developer):
       - Implementar loading states
       - Adicionar skeleton loaders
       - Melhorar mensagens de erro
       - Criar success notifications
       - Implementar progress indicators
       - Adicionar micro-interactions
       - Revisar estados disabled/hover/active

    4. USABILIDADE (architect + developer):
       - Analisar fluxo de navegação
       - Verificar hierarquia de informação
       - Revisar labels e microcopy
       - Melhorar consistência de UI
       - Identificar pontos de fricção
       - Otimizar formulários
       - Implementar atalhos de teclado

    5. DESIGN SYSTEM (developer):
       - Revisar uso de shadcn/ui
       - Verificar consistência de componentes
       - Padronizar espaçamentos
       - Revisar tipografia
       - Criar tokens de design
       - Documentar componentes

    6. EXPERIÊNCIA MOBILE (developer):
       - Otimizar gestos (swipe, tap, long-press)
       - Implementar pull-to-refresh
       - Melhorar navegação mobile
       - Otimizar inputs mobile
       - Revisar bottom navigation
       - Testar em dispositivos reais

    7. DARK MODE (developer):
       - Verificar implementação atual
       - Revisar contraste em dark mode
       - Testar transições de tema
       - Otimizar cores para dark mode
       - Salvar preferência do usuário

    8. INTERNACIONALIZAÇÃO (i18n) (developer):
       - Revisar implementação PT/EN
       - Verificar strings hardcoded
       - Testar mudança de idioma
       - Otimizar carregamento de traduções
       - Suportar RTL (futuro)

    9. PERFORMANCE PERCEBIDA (developer):
       - Otimizar First Contentful Paint
       - Implementar lazy loading de imagens
       - Adicionar placeholders
       - Otimizar transições
       - Reduzir layout shifts

    PÁGINAS PARA ANÁLISE:
    - Auth.tsx (Login/Cadastro)
    - Dashboard.tsx (Visão geral)
    - Goals.tsx (Lista de metas)
    - GoalDetail.tsx (Detalhes e tarefas)
    - Profile.tsx (Perfil e configurações)
    - Tasks.tsx (Gerenciamento de tarefas)

    ENTREGÁVEIS:

    1. **Relatório de Acessibilidade**:
       - Violações WCAG encontradas
       - Score de acessibilidade (Lighthouse)
       - Priorização de correções
       - Teste com screen readers

    2. **Análise de UX**:
       - Fluxos problemáticos
       - Pontos de fricção
       - Sugestões de melhoria
       - Heatmap de problemas

    3. **Implementações de Melhorias**:
       - Código corrigido (acessibilidade)
       - Componentes otimizados
       - Melhorias de feedback visual
       - Skeleton loaders

    4. **Guia de Acessibilidade**:
       - Checklist WCAG 2.1
       - Boas práticas
       - Exemplos de código acessível
       - Ferramentas recomendadas

    5. **Design Tokens e Sistema**:
       - Tokens de cores, espaçamentos, tipografia
       - Documentação de componentes
       - Variantes e estados
       - Guidelines de uso

    FOCO: INCLUSÃO E EXPERIÊNCIA
    Aplicativo deve ser utilizável por todos, em qualquer dispositivo.
    """

    print("\n" + "="*80)
    print("WORKFLOW 3: UI/UX E ACESSIBILIDADE")
    print("Goal Task Manager - UI/UX & Accessibility")
    print("="*80 + "\n")

    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Análise de UI/UX concluída!")
        print(f"Resultados salvos em: outputs/")
        print("\n♿ PRÓXIMOS PASSOS:")
        print("1. Corrigir violações WCAG críticas")
        print("2. Implementar melhorias de feedback")
        print("3. Testar em dispositivos reais")
        print("4. Validar com usuários reais")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
