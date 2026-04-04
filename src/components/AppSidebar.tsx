import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Phone, FileUp, FileBarChart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/calls', icon: Phone, label: 'Ligações' },
  { to: '/upload', icon: FileUp, label: 'Upload' },
  { to: '/reports', icon: FileBarChart, label: 'Relatórios' },
];

const AppSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen gradient-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
        <img src="/voxy-logo.png" alt="Voxy" className="h-8 w-auto" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
