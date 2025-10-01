import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  estimated_duration: number | null;
  actual_duration: number | null;
  due_date: string | null;
  prerequisites: string[] | null;
  goal_id: string | null;
  user_id: string;
  is_ai_generated: boolean | null;
  order_sequence: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const GoalDetails = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && goalId) {
      fetchGoalDetails();
    }
  }, [user, goalId]);

  const fetchGoalDetails = async () => {
    try {
      // Fetch goal
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', user?.id)
        .single();

      if (goalError) throw goalError;
      if (goalData) {
        setGoal(goalData);
      }

      // Fetch tasks for this goal
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user?.id)
        .order('order_sequence', { ascending: true });

      if (tasksError) throw tasksError;
      if (tasksData) {
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching goal details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da meta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : task
      ));

      if (newStatus === 'completed') {
        toast({
          title: "Tarefa concluída! 🎉",
          description: "Parabéns por mais um passo em direção às suas metas!",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'media':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'baixa':
        return <Circle className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`priority-${priority}`}>
        {priority}
      </Badge>
    );
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!goal) {
    return (
      <Layout>
        <div className="p-6 max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Meta não encontrada</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{goal.title}</h1>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="goal-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Progresso</h3>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{completedTasks} concluídas</span>
              <span className="text-muted-foreground">{totalTasks - completedTasks} restantes</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {goal.target_date && (
            <p className="text-sm text-muted-foreground">
              Data alvo: {new Date(goal.target_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </Card>

        {/* Tasks List */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-3">
            Tarefas ({totalTasks})
          </h3>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="goal-card text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa criada ainda</p>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="goal-card">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />

                  <div className="flex-1">
                    {/* Task Content */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${
                        task.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-card-foreground'
                      }`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 ml-2">
                        {getPriorityIcon(task.priority)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.estimated_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimated_duration}min
                        </span>
                      )}

                      {task.due_date && (
                        <span>
                          Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GoalDetails;
