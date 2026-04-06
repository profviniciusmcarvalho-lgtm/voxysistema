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
  const { logout, user } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen gradient-sidebar border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background: 'linear-gradient(135deg, #818cf8, #4f46e5)'}}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M4 13 C4 8.03 8.03 4 12 4 C15.97 4 20 8.03 20 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <rect x="2" y="11.5" width="3.5" height="5.5" rx="1.75" fill="white"/>
            <rect x="18.5" y="11.5" width="3.5" height="5.5" rx="1.75" fill="white"/>
            <path d="M20 17 Q18 20.5 15 21" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <span className="text-sidebar-foreground font-bold text-xl tracking-tight">Voxy</span>
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

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
        </div>
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
