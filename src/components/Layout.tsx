import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, CheckSquare, User, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;