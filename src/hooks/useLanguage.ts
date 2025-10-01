import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// Translation dictionary
const translations = {
  pt: {
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tarefas',
    profile: 'Perfil',
    
    // Common
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso!',
    cancel: 'Cancelar',
    save: 'Salvar',
    create: 'Criar',
    edit: 'Editar',
    delete: 'Excluir',
    
    // Dashboard
    'track-progress': 'Acompanhe seu progresso',
    'general-progress': 'Progresso Geral',
    'completed-tasks': 'tarefas concluídas',
    'remaining-tasks': 'tarefas restantes',
    'weekly-consistency': 'Consistência Semanal',
    'active-goals': 'Metas Ativas',
    'view-all': 'Ver todas',
    'no-active-goals': 'Nenhuma meta ativa',
    'create-first-goal': 'Criar primeira meta',
    'current-streak': 'Sequência Atual',
    'current-level': 'Nível Atual',
    days: 'dias',
    
    // Tasks
    today: 'Hoje',
    goals: 'Metas',
    'ai-suggestions': 'Sugestões IA',
    'add-task': 'Add Task',
    'no-tasks-found': 'Nenhuma tarefa encontrada',
    'start-creating': 'Comece criando sua primeira tarefa',
    'create-task': 'Criar Tarefa',
    
    // Profile
    'profile-settings': 'Configurações e progresso',
    'member-since': 'Membro desde',
    'completed-goals': 'Metas Concluídas',
    'completed-tasks-profile': 'Tarefas Realizadas',
    'quick-settings': 'Configurações Rápidas',
    notifications: 'Notificações',
    'task-reminders': 'Lembretes de tarefas',
    'dark-mode': 'Modo Escuro',
    'night-appearance': 'Aparência noturna',
    language: 'Idioma',
    'language-preference': 'Preferência de idioma',
    'sign-out': 'Sair da conta',
    
    // Goal Form
    'create-goal': 'Criar Meta',
    'goal-title': 'Título da Meta',
    'goal-description': 'Descrição',
    'goal-category': 'Categoria',
    'target-date': 'Data Limite',
    'importance-level': 'Nível de Importância',
    'effort-estimated': 'Esforço Estimado',
    'pick-date': 'Escolher data',
    'creating-goal': 'Criando meta...',
    'goal-created': 'Meta criada com sucesso!',
    'generating-tasks': 'Gerando tarefas com IA...',
    
    // Categories
    personal: 'Pessoal',
    professional: 'Profissional',
    health: 'Saúde',
    education: 'Educação',
    finance: 'Financeiro',
    other: 'Outro',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    profile: 'Profile',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success!',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    
    // Dashboard
    'track-progress': 'Track your progress',
    'general-progress': 'General Progress',
    'completed-tasks': 'completed tasks',
    'remaining-tasks': 'remaining tasks',
    'weekly-consistency': 'Weekly Consistency',
    'active-goals': 'Active Goals',
    'view-all': 'View all',
    'no-active-goals': 'No active goals',
    'create-first-goal': 'Create first goal',
    'current-streak': 'Current Streak',
    'current-level': 'Current Level',
    days: 'days',
    
    // Tasks
    today: 'Today',
    goals: 'Goals',
    'ai-suggestions': 'AI Suggestions',
    'add-task': 'Add Task',
    'no-tasks-found': 'No tasks found',
    'start-creating': 'Start by creating your first task',
    'create-task': 'Create Task',
    
    // Profile
    'profile-settings': 'Settings and progress',
    'member-since': 'Member since',
    'completed-goals': 'Completed Goals',
    'completed-tasks-profile': 'Completed Tasks',
    'quick-settings': 'Quick Settings',
    notifications: 'Notifications',
    'task-reminders': 'Task reminders',
    'dark-mode': 'Dark Mode',
    'night-appearance': 'Night appearance',
    language: 'Language',
    'language-preference': 'Language preference',
    'sign-out': 'Sign out',
    
    // Goal Form
    'create-goal': 'Create Goal',
    'goal-title': 'Goal Title',
    'goal-description': 'Description',
    'goal-category': 'Category',
    'target-date': 'Target Date',
    'importance-level': 'Importance Level',
    'effort-estimated': 'Estimated Effort',
    'pick-date': 'Pick a date',
    'creating-goal': 'Creating goal...',
    'goal-created': 'Goal created successfully!',
    'generating-tasks': 'Generating AI tasks...',
    
    // Categories
    personal: 'Personal',
    professional: 'Professional',
    health: 'Health',
    education: 'Education',
    finance: 'Finance',
    other: 'Other',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback hook for when used outside provider
    return useFallbackLanguage();
  }
  return context;
};

// Fallback hook for components used outside the provider
const useFallbackLanguage = () => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    if (user) {
      fetchUserLanguage();
    }
  }, [user]);

  const fetchUserLanguage = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('language_preference')
        .eq('user_id', user?.id)
        .single();
      
      if (data?.language_preference) {
        setLanguageState(data.language_preference as Language);
      }
    } catch (error) {
      console.error('Error fetching user language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: lang })
        .eq('user_id', user?.id);

      if (error) throw error;
      setLanguageState(lang);
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { language, setLanguage, t };
};

export { LanguageContext, translations };