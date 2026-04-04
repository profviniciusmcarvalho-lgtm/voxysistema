import { Users, Phone, PhoneOff, TrendingUp, CalendarDays } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentCalls from '@/components/RecentCalls';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { clients, calls, loading } = useFirestoreData();
  const { user } = useAuth();

  const today = new Date();
  const todayCalls = calls.filter(c => c.date.toDateString() === today.toDateString());
  const answered = todayCalls.filter(c => c.outcome === 'answered').length;

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekCalls = calls.filter(c => c.date >= weekAgo);

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'usuário';

  const recentCalls = calls.slice(0, 8);

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting()}, {displayName}!</h1>
        <p className="text-sm text-muted-foreground">
          {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes" value={clients.length} subtitle="Total cadastrado" icon={Users} variant="primary" />
        <StatCard title="Ligações Hoje" value={todayCalls.length} subtitle="Realizadas hoje" icon={Phone} />
        <StatCard title="Atendidas Hoje" value={answered} subtitle={`de ${todayCalls.length} ligações`} icon={TrendingUp} variant="secondary" />
        <StatCard title="Últimos 7 dias" value={weekCalls.length} subtitle="Total na semana" icon={CalendarDays} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Ligações Recentes</h2>
          {recentCalls.length > 0 ? (
            <RecentCalls calls={recentCalls} showDate />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Phone className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma ligação registrada ainda</p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Clientes por Status</h2>
          {clients.length > 0 ? (
            <div className="space-y-4">
              {(['active', 'prospect', 'inactive'] as const).map((status) => {
                const count = clients.filter(c => c.status === status).length;
                const total = clients.length || 1;
                const pct = Math.round((count / total) * 100);
                const labels = { active: 'Ativos', prospect: 'Prospects', inactive: 'Inativos' };
                const colors = { active: 'bg-success', prospect: 'bg-info', inactive: 'bg-muted-foreground' };
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{labels[status]}</span>
                      <span className="text-muted-foreground">{count} <span className="text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[status]} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum cliente cadastrado ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
