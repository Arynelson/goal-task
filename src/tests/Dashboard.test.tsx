import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';

// Mock do Supabase - precisa estar dentro do vi.mock para evitar hoisting issues
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

// Mock dos hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
  }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        dashboard: 'Dashboard',
        'track-progress': 'Acompanhe seu progresso',
        'general-progress': 'Progresso Geral',
        'completed-tasks': 'tarefas concluídas',
        'remaining-tasks': 'tarefas restantes',
        'weekly-consistency': 'Consistência Semanal',
        'active-goals': 'Metas Ativas',
        'view-all': 'Ver todas',
        'no-active-goals': 'Nenhuma meta ativa',
        'create-first-goal': 'Criar primeira meta',
        days: 'dias',
        'current-streak': 'Sequência atual',
        'current-level': 'Nível Atual',
      };
      return translations[key] || key;
    },
    language: 'pt',
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock do GoalForm
vi.mock('@/components/GoalForm', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dashboard Component', () => {
  it('deve renderizar o título do Dashboard', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Acompanhe seu progresso')).toBeInTheDocument();
  });

  it('deve exibir progresso geral', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Progresso Geral')).toBeInTheDocument();
  });

  it('deve exibir consistência semanal', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Consistência Semanal')).toBeInTheDocument();
  });

  it('deve exibir metas ativas', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Metas Ativas')).toBeInTheDocument();
  });

  it('deve exibir botão ver todas', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Ver todas')).toBeInTheDocument();
  });

  it('deve exibir estatísticas de streak', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Sequência atual')).toBeInTheDocument();
  });
});
