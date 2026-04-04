import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Phone, FileUp, FileBarChart } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/calls', icon: Phone, label: 'Ligações' },
  { to: '/upload', icon: FileUp, label: 'Upload' },
  { to: '/reports', icon: FileBarChart, label: 'Relatórios' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 card-shadow">
      <div className="flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
