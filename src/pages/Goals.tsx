import { useState, useEffect } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import GoalForm from '@/components/GoalForm';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress_percentage: number;
  status: string;
  target_date: string;
  totalTasks?: number;
  completedTasks?: number;
}

const Goals = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingGoal, setDeletingGoal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      // Fetch all active goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Fetch all tasks
      const { data: allTasksData } = await supabase
        .from('tasks')
        .select('id, status, goal_id')
        .eq('user_id', user?.id);

      if (goalsData && allTasksData) {
        // Calculate tasks per goal
        const goalsWithTasks = goalsData.map(goal => {
          const goalTasks = allTasksData.filter(task => task.goal_id === goal.id);
          const completedTasks = goalTasks.filter(task => task.status === 'completed').length;
          const totalTasks = goalTasks.length;

          return {
            ...goal,
            totalTasks,
            completedTasks,
            progress_percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          };
        });

        setGoals(goalsWithTasks);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    setDeletingGoal(goalId);
    try {
      // Delete all tasks related to this goal
      await supabase
        .from('tasks')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      // Delete all milestones related to this goal
      await supabase
        .from('milestones')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      // Delete the goal itself
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setGoals(prev => prev.filter(goal => goal.id !== goalId));

      toast({
        title: "Meta deletada",
        description: "A meta e todas as suas tarefas foram removidas com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingGoal(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('active-goals')}</h1>
            <p className="text-muted-foreground">Todas as suas metas</p>
          </div>
          <GoalForm onGoalCreated={fetchGoals}>
            <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              <Plus className="w-5 h-5" />
            </button>
          </GoalForm>
        </div>

        {/* Goals List */}
        <div className="space-y-3 mb-6">
          {goals.length === 0 ? (
            <Card className="goal-card text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('no-active-goals')}</p>
              <GoalForm onGoalCreated={fetchGoals}>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create-first-goal')}
                </Button>
              </GoalForm>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className="goal-card relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-8">
                    <h4 className="font-medium text-card-foreground mb-1">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{goal.progress_percentage}%</span>
                    <p className="text-xs text-muted-foreground">
                      {goal.completedTasks || 0}/{goal.totalTasks || 0} tasks
                    </p>
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="progress-bar mb-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${goal.progress_percentage}%` }}
                  />
                </div>

                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={deletingGoal === goal.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar Meta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar a meta "{goal.title}"?
                        Esta ação irá remover permanentemente a meta e todas as suas tarefas associadas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteGoal(goal.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingGoal === goal.id ? "Deletando..." : "Deletar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <GoalForm onGoalCreated={fetchGoals}>
          <button className="fab">
            <Plus className="w-6 h-6" />
          </button>
        </GoalForm>
      </div>
    </Layout>
  );
};

export default Goals;
