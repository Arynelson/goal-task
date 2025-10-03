"""
Workflow 4: PERFORMANCE E OTIMIZAÇÃO
Goal Task Manager - Performance Optimization
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
    ANÁLISE DE PERFORMANCE - GOAL TASK MANAGER

    CONTEXTO:
    Aplicativo React que precisa ser rápido e eficiente em todos os dispositivos.

    OBJETIVO:
    Otimizar performance, reduzir bundle size e melhorar métricas Core Web Vitals.

    ÁREAS DE ANÁLISE:

    1. PERFORMANCE REACT (developer + otimizador):
       - Identificar re-renders desnecessários
       - Implementar React.memo em componentes puros
       - Usar useMemo para computações caras
       - Usar useCallback para funções em deps
       - Revisar dependências de useEffect
       - Otimizar Context API (split contexts)
       - Implementar virtualization (react-window)

    2. BUNDLE SIZE E CODE SPLITTING (architect):
       - Analisar tamanho atual do bundle
       - Identificar dependências pesadas
       - Implementar lazy loading de rotas
       - Implementar dynamic imports
       - Revisar tree-shaking
       - Otimizar imports (barrel files)
       - Analisar com webpack-bundle-analyzer

    3. OTIMIZAÇÃO DE ASSETS (developer):
       - Comprimir imagens (WebP, AVIF)
       - Implementar lazy loading de imagens
       - Otimizar SVGs
       - Usar sprite sheets se aplicável
       - Otimizar fonts (subset, woff2)
       - Implementar resource hints (preload, prefetch)

    4. OTIMIZAÇÃO SUPABASE (developer + architect):
       - Revisar queries (select específico)
       - Implementar paginação
       - Usar índices de database
       - Implementar cache com React Query
       - Otimizar real-time subscriptions
       - Batch operations quando possível
       - Revisar N+1 queries

    5. CACHE ESTRATÉGICO (architect):
       - Implementar React Query/SWR
       - Configurar stale time adequado
       - Implementar optimistic updates
       - Cache de imagens (service worker)
       - LocalStorage para dados não-críticos
       - Revisar invalidação de cache

    6. BUILD E DEPLOY (architect):
       - Configurar compression (gzip/brotli)
       - Implementar CDN para assets
       - Otimizar Vite build
       - Configurar cache headers
       - Implementar service worker (PWA)
       - Minification e uglification

    7. CORE WEB VITALS (otimizador):
       - LCP (Largest Contentful Paint) < 2.5s
       - FID (First Input Delay) < 100ms
       - CLS (Cumulative Layout Shift) < 0.1
       - TTFB (Time to First Byte) < 600ms
       - FCP (First Contentful Paint) < 1.8s
       - TTI (Time to Interactive) < 3.8s

    8. RUNTIME PERFORMANCE (otimizador):
       - Otimizar animations (CSS vs JS)
       - Usar requestAnimationFrame
       - Debounce/Throttle de eventos
       - Otimizar scroll performance
       - Reduzir main thread blocking
       - Usar Web Workers para tarefas pesadas

    9. NETWORK OPTIMIZATION (developer):
       - Implementar request deduplication
       - Batch API calls
       - Implement retry logic
       - Optimize payload size
       - Use HTTP/2 features
       - Minimize requests

    MÉTRICAS ATUAIS PARA BASELINE:
    - Bundle size: ? MB
    - Time to Interactive: ? s
    - First Contentful Paint: ? s
    - Total requests: ?
    - Page weight: ? MB

    FERRAMENTAS DE ANÁLISE:
    - Lighthouse (Performance score)
    - Chrome DevTools (Performance tab)
    - React DevTools Profiler
    - Bundle Analyzer
    - WebPageTest
    - GTmetrix

    ENTREGÁVEIS:

    1. **Relatório de Performance**:
       - Métricas atuais vs objetivos
       - Análise de bundle size
       - Waterfall de requests
       - Identificação de bottlenecks
       - Performance score (antes/depois)

    2. **Plano de Otimização**:
       - Priorização por impacto
       - Quick wins (alto impacto, baixo esforço)
       - Optimizações de médio prazo
       - Melhorias de longo prazo

    3. **Implementações**:
       - Código otimizado
       - Lazy loading implementado
       - React Query configurado
       - Memoization aplicada
       - Bundle splitting configurado

    4. **Configurações**:
       - vite.config.ts otimizado
       - Compression configurada
       - Cache headers
       - Service worker (PWA)

    5. **Documentação**:
       - Performance budget
       - Monitoring setup
       - Best practices
       - Continuous performance tracking

    OBJETIVOS:
    - Bundle inicial: < 200KB (gzip)
    - LCP: < 2.5s
    - FID: < 100ms
    - CLS: < 0.1
    - Lighthouse Performance: > 90

    FOCO: VELOCIDADE E EFICIÊNCIA
    Performance é feature. Usuários esperam apps rápidos.
    """

    print("\n" + "="*80)
    print("WORKFLOW 4: PERFORMANCE E OTIMIZAÇÃO")
    print("Goal Task Manager - Performance Optimization")
    print("="*80 + "\n")

    results = workflow.run(user_request, save_plan=True)

    if results:
        workflow.save_results(results)
        print("\n[DONE] Análise de performance concluída!")
        print(f"Resultados salvos em: outputs/")
        print("\n⚡ PRÓXIMOS PASSOS:")
        print("1. Implementar quick wins")
        print("2. Configurar React Query")
        print("3. Implementar code splitting")
        print("4. Medir impacto das otimizações")
        print("5. Estabelecer performance budget")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
