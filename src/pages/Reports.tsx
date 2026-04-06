import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Download, Phone, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CallRecord } from '@/types/client';
import { useFirestoreData } from '@/hooks/useFirestoreData';

type Preset = 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'custom';

const presets: { value: Preset; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const getRangeForPreset = (preset: Preset, customFrom: string, customTo: string): [Date, Date] => {
  const now = new Date();
  switch (preset) {
    case 'today': return [startOfDay(now), endOfDay(now)];
    case 'yesterday': { const y = new Date(now); y.setDate(y.getDate() - 1); return [startOfDay(y), endOfDay(y)]; }
    case '7days': { const f = new Date(now); f.setDate(f.getDate() - 6); return [startOfDay(f), endOfDay(now)]; }
    case '30days': { const f = new Date(now); f.setDate(f.getDate() - 29); return [startOfDay(f), endOfDay(now)]; }
    case 'month': { const f = new Date(now.getFullYear(), now.getMonth(), 1); return [startOfDay(f), endOfDay(now)]; }
    case 'custom': {
      const f = customFrom ? startOfDay(new Date(customFrom + 'T00:00:00')) : startOfDay(now);
      const t = customTo ? endOfDay(new Date(customTo + 'T00:00:00')) : endOfDay(now);
      return [f, t];
    }
  }
};

const outcomeLabels: Record<CallRecord['outcome'], string> = {
  answered: 'Atendeu',
  no_answer: 'Não Atendeu',
  voicemail: 'Caixa Postal',
  busy: 'Ocupado',
  callback: 'Retornar',
};

const outcomeColors: Record<CallRecord['outcome'], string> = {
  answered: '#22c55e',
  no_answer: '#ef4444',
  voicemail: '#f59e0b',
  busy: '#94a3b8',
  callback: '#3b82f6',
};

const badgeClasses: Record<CallRecord['outcome'], string> = {
  answered: 'bg-success/10 text-success border-success/20',
  no_answer: 'bg-destructive/10 text-destructive border-destructive/20',
  voicemail: 'bg-warning/10 text-warning border-warning/20',
  busy: 'bg-muted text-muted-foreground border-border',
  callback: 'bg-info/10 text-info border-info/20',
};

const Reports = () => {
  const { calls, loading } = useFirestoreData();
  const [preset, setPreset] = useState<Preset>('today');
  const [customFrom, setCustomFrom] = useState(new Date().toISOString().split('T')[0]);
  const [customTo, setCustomTo] = useState(new Date().toISOString().split('T')[0]);

  const [rangeFrom, rangeTo] = useMemo(() => getRangeForPreset(preset, customFrom, customTo), [preset, customFrom, customTo]);

  const filteredCalls = useMemo(
    () => calls.filter(c => c.date >= rangeFrom && c.date <= rangeTo),
    [calls, rangeFrom, rangeTo]
  );

  const answered = filteredCalls.filter(c => c.outcome === 'answered').length;
  const totalDuration = filteredCalls.reduce((sum, c) => sum + c.duration, 0);
  const answeredPct = filteredCalls.length > 0 ? Math.round((answered / filteredCalls.length) * 100) : 0;

  const chartData = (Object.keys(outcomeLabels) as CallRecord['outcome'][]).map(key => ({
    name: outcomeLabels[key],
    total: filteredCalls.filter(c => c.outcome === key).length,
    color: outcomeColors[key],
  })).filter(d => d.total > 0);

  const handleExport = () => {
    const dateLabel = preset === 'custom'
      ? `${customFrom}_${customTo}`
      : preset;
    const header = 'Data,Horário,Cliente,Resultado,Duração (min),Observações,Próxima Ação\n';
    const rows = filteredCalls.map(c =>
      `"${c.date.toLocaleDateString('pt-BR')}","${c.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}","${c.clientName}","${outcomeLabels[c.outcome]}",${c.duration},"${c.notes}","${c.nextAction || ''}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-ligacoes-${dateLabel}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Relatório de ligações por período</p>
        </div>
        <Button variant="outline" className="gap-2 self-start sm:self-auto" onClick={handleExport} disabled={filteredCalls.length === 0}>
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      {/* Period filter */}
      <div className="bg-card rounded-xl p-4 card-shadow space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                preset === p.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-40" />
            <span className="text-sm text-muted-foreground">até</span>
            <Input type="date" value={customTo} min={customFrom} onChange={e => setCustomTo(e.target.value)} className="w-40" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{filteredCalls.length}</p>
          <p className="text-xs text-muted-foreground">Total Ligações</p>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold">{answered}</p>
          <p className="text-xs text-muted-foreground">Atendidas ({answeredPct}%)</p>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <Clock className="w-6 h-6 text-info mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalDuration}min</p>
          <p className="text-xs text-muted-foreground">Tempo Total</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="font-semibold mb-4">Resultados por Tipo</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [value, 'Ligações']}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Detalhamento</h2>
        </div>
        {filteredCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Duração</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Horário</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Observações</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Próxima Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCalls.map(call => (
                  <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{call.clientName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-xs ${badgeClasses[call.outcome]}`}>{outcomeLabels[call.outcome]}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{call.duration > 0 ? `${call.duration} min` : '--'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{call.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell max-w-xs truncate">{call.notes || '--'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{call.nextAction || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma ligação registrada neste período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
