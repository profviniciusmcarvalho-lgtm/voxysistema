import { Users, Phone, PhoneOff, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentCalls from '@/components/RecentCalls';
import { useFirestoreData } from '@/hooks/useFirestoreData';

const Dashboard = () => {
  const { clients, calls, loading } = useFirestoreData();

  const todayCalls = calls.filter(c => {
    const today = new Date();
    return c.date.toDateString() === today.toDateString();
  });
  const answered = todayCalls.filter(c => c.outcome === 'answered').length;

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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas atividades</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes" value={clients.length} subtitle="Total cadastrado" icon={Users} variant="primary" />
        <StatCard title="Ligações Hoje" value={todayCalls.length} subtitle="Realizadas" icon={Phone} trend={{ value: 15, positive: true }} />
        <StatCard title="Atendidas" value={answered} subtitle={`de ${todayCalls.length} ligações`} icon={TrendingUp} variant="secondary" />
        <StatCard title="Pendentes" value={todayCalls.length - answered} subtitle="Não atendidas" icon={PhoneOff} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Ligações Recentes</h2>
          <RecentCalls calls={todayCalls} />
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Clientes por Status</h2>
          <div className="space-y-4">
            {(['active', 'prospect', 'inactive'] as const).map((status) => {
              const count = clients.filter(c => c.status === status).length;
              const total = clients.length || 1;
              const labels = { active: 'Ativos', prospect: 'Prospects', inactive: 'Inativos' };
              const colors = { active: 'bg-success', prospect: 'bg-info', inactive: 'bg-muted-foreground' };
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{labels[status]}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[status]} transition-all`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
