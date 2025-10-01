import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Lock, Calendar, TrendingUp, Target, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface DashboardStats {
  totalGoals: number;
  completedTasks: number;
  totalTasks: number;
  currentStreak: number;
  weeklyConsistency: number[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedTasks: 0,
    totalTasks: 0,
    currentStreak: 0,
    weeklyConsistency: [1, 1, 1, 1, 1, 1, 0] // Example: 6 days completed this week
  });
  const [loading, setLoading] = useState(true);
  const [deletingGoal, setDeletingGoal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch ALL tasks for all goals (not just the top 3)
      const { data: allTasksData } = await supabase
        .from('tasks')
        .select('id, status, goal_id, completed_at')
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

        // Calculate global stats
        const totalTasks = allTasksData.length;
        const completedTasks = allTasksData.filter(task => task.status === 'completed').length;

        // Calculate weekly consistency (last 7 days)
        const today = new Date();
        const weeklyConsistency = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(today);
          day.setDate(today.getDate() - (6 - i)); // Start from 6 days ago
          day.setHours(0, 0, 0, 0);

          const nextDay = new Date(day);
          nextDay.setDate(day.getDate() + 1);

          // Check if any tasks were completed on this day
          const hasCompletedTasks = allTasksData.some(task => {
            if (!task.completed_at) return false;
            const completedDate = new Date(task.completed_at);
            return completedDate >= day && completedDate < nextDay;
          });

          return hasCompletedTasks ? 1 : 0;
        });

        // Calculate current streak (consecutive days with completed tasks)
        let currentStreak = 0;
        const completedTasksWithDate = allTasksData.filter(task =>
          task.status === 'completed' && task.completed_at
        );

        if (completedTasksWithDate.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let checkDate = new Date(today);
          const completedDates = new Set(
            completedTasksWithDate.map(t => {
              const d = new Date(t.completed_at!);
              d.setHours(0, 0, 0, 0);
              return d.getTime();
            })
          );

          // Check if there's activity today or yesterday to start streak
          const hasToday = completedDates.has(today.getTime());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const hasYesterday = completedDates.has(yesterday.getTime());

          if (hasToday || hasYesterday) {
            checkDate = hasToday ? today : yesterday;

            while (completedDates.has(checkDate.getTime())) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }
        }

        setStats(prev => ({
          ...prev,
          totalTasks,
          completedTasks,
          weeklyConsistency,
          currentStreak,
        }));
      }

      // Fetch profile for additional info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_goals_completed')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setStats(prev => ({
          ...prev,
          totalGoals: profileData.total_goals_completed || 0,
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const overallProgress = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

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
            <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('track-progress')}</p>
          </div>
          <Button variant="outline" size="icon">
            <Lock className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="goal-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">{t('general-progress')}</h3>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{stats.completedTasks} {t('completed-tasks')}</span>
              <span className="text-muted-foreground">{stats.totalTasks - stats.completedTasks} {t('remaining-tasks')}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Weekly Consistency */}
        <Card className="goal-card mb-6">
          <h3 className="font-semibold text-card-foreground mb-4">{t('weekly-consistency')}</h3>
          <div className="flex justify-between items-end gap-1">
            {stats.weeklyConsistency.map((completed, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full rounded-sm mb-1 ${
                    completed ? 'bg-chart-active' : 'bg-chart-inactive'
                  }`}
                  style={{ height: completed ? '32px' : '16px' }}
                />
                <span className="text-xs text-muted-foreground">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Goals */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t('active-goals')}</h3>
          <Link to="/goals" className="text-primary text-sm font-medium">
            {t('view-all')}
          </Link>
        </div>

        <div className="space-y-3 mb-6">
          {goals.length === 0 ? (
            <Card className="goal-card text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('no-active-goals')}</p>
              <GoalForm onGoalCreated={fetchDashboardData}>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create-first-goal')}
                </Button>
              </GoalForm>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card
                key={goal.id}
                className="goal-card relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
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
                      onClick={(e) => e.stopPropagation()}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="stats-card text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">{t('days')}</div>
            <div className="text-sm text-card-foreground">{t('current-streak')}</div>
          </Card>
          
          <Card className="stats-card text-center">
            <div className="text-2xl font-bold text-success mb-1">{t('current-level')}</div>
            <div className="text-xs text-muted-foreground">{t('current-level')}</div>
          </Card>
        </div>

        {/* Floating Action Button */}
        <GoalForm onGoalCreated={fetchDashboardData}>
          <button className="fab">
            <Plus className="w-6 h-6" />
          </button>
        </GoalForm>
      </div>
    </Layout>
  );
};

export default Dashboard;