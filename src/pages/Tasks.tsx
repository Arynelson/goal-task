import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, AlertTriangle, CheckCircle2, Circle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GoalForm from '@/components/GoalForm';
import { useLanguage } from '@/hooks/useLanguage';

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

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedTab, setSelectedTab] = useState<'today' | 'goals' | 'completed'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      // Fetch tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setTasks(data);
      }

      // Fetch goals for the goals tab
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (goalsData && data) {
        // Calculate tasks per goal
        const goalsWithTasks = goalsData.map(goal => {
          const goalTasks = data.filter(task => task.goal_id === goal.id);
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
      console.error('Error fetching tasks:', error);
      toast({
        title: t('error'),
        description: "Try again later.",
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
        title: t('error'),
        description: "Try again later.",
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

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter(task => {
    if (selectedTab === 'today') {
      // Show tasks due today or overdue (pending/in-progress only)
      if (task.status === 'completed') return false;

      if (!task.due_date) return false; // Only show tasks with due dates

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Show tasks due today or overdue
      return dueDate <= today;
    }
    if (selectedTab === 'completed') {
      // Show completed tasks
      return task.status === 'completed';
    }
    return true;
  });

  const completedToday = tasks.filter(task => {
    const completedToday = task.status === 'completed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === new Date().toDateString();
    return completedToday;
  }).length;

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
            <h1 className="text-2xl font-bold text-foreground">{t('tasks')}</h1>
            <p className="text-muted-foreground">Organize seu progresso</p>
          </div>
          <GoalForm onGoalCreated={fetchTasks}>
            <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              <Plus className="w-5 h-5" />
            </button>
          </GoalForm>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: 'today', label: t('today') },
            { key: 'goals', label: t('goals') },
            { key: 'completed', label: 'Concluídas' }
          ] as const).map((tab) => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab(tab.key as 'today' | 'goals' | 'completed')}
              className={`whitespace-nowrap ${
                selectedTab === tab.key ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Today's Progress */}
        {selectedTab === 'today' && (
          <Card className="goal-card mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-card-foreground">Tarefas de Hoje</h3>
              <span className="text-primary font-medium">
                {completedToday}/{filteredTasks.length + completedToday} concluídas
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: filteredTasks.length + completedToday > 0 
                    ? `${(completedToday / (filteredTasks.length + completedToday)) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </Card>
        )}

        {/* Goals List (when goals tab is selected) */}
        {selectedTab === 'goals' && (
          <div className="space-y-3">
            {goals.length === 0 ? (
              <Card className="goal-card text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhuma meta encontrada</p>
                <GoalForm onGoalCreated={fetchTasks}>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Meta
                  </Button>
                </GoalForm>
              </Card>
            ) : (
              goals.map((goal) => (
                <Card
                  key={goal.id}
                  className="goal-card cursor-pointer hover:shadow-md transition-shadow"
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
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tasks List */}
        {selectedTab !== 'goals' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="goal-card text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  {selectedTab === 'today'
                    ? 'Nenhuma tarefa para hoje'
                    : selectedTab === 'completed'
                    ? 'Nenhuma tarefa concluída'
                    : t('no-tasks-found')
                  }
                </p>
                <GoalForm onGoalCreated={fetchTasks}>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create-task')}
                  </Button>
                </GoalForm>
              </Card>
            ) : (
            filteredTasks.map((task) => (
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
                      
                      {task.prerequisites && task.prerequisites.length > 0 && (
                        <span className="text-orange-600">
                          📋 Depende de: {task.prerequisites[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
            )}
          </div>
        )}

        {/* Floating Action Button */}
        <GoalForm onGoalCreated={fetchTasks}>
          <button className="fab">
            <Plus className="w-6 h-6" />
          </button>
        </GoalForm>
      </div>
    </Layout>
  );
};

export default Tasks;