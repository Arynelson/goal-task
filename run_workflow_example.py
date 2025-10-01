"""
Exemplo de execução completa do workflow
"""

from workflow_autogen import SimpleWorkflow

def main():
    workflow = SimpleWorkflow()

    # Tarefa muito simples para testar execução completa
    user_request = """
    Criar uma função Python simples chamada somar(a, b) que:
    - Recebe dois números
    - Retorna a soma
    - Tem docstring
    """

    print("\n" + "="*80)
    print("EXECUTANDO WORKFLOW COMPLETO")
    print("="*80 + "\n")

    # Executar workflow (vai pedir confirmação)
    results = workflow.run(user_request, save_plan=True)

    if results:
        # Salvar resultados
        workflow.save_results(results)
        print("\n[DONE] Workflow executado com sucesso!")
        print(f"Resultados salvos em: outputs/")
    else:
        print("\n[CANCEL] Workflow cancelado.")

if __name__ == "__main__":
    main()
