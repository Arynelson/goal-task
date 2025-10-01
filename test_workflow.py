"""
Teste do workflow simplificado
"""

from workflow_autogen import SimpleWorkflow

def test_simple_task():
    """Testa uma tarefa simples"""

    workflow = SimpleWorkflow()

    user_request = """
    Criar uma função Python simples que:
    - Recebe uma lista de números
    - Retorna a média dos números
    - Tem tratamento de erro para lista vazia
    - Tem docstring completa

    Quero o código e testes unitários.
    """

    print("[TEST] Testando workflow com tarefa simples...\n")

    # Executar apenas o plano (sem executar)
    print("[PLAN] Criando plano...\n")
    plan = workflow.task_organizer.create_workflow_plan(user_request)

    # Exibir plano
    workflow.task_organizer.display_plan(plan)

    print("[OK] Teste do plano concluido! O plano foi criado com sucesso.\n")
    print("Para executar o plano completo, use: workflow.run(user_request)")

if __name__ == "__main__":
    test_simple_task()
