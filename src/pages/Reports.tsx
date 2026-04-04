import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Download, Phone, PhoneOff, Clock } from 'lucide-react';
import { CallRecord } from '@/types/client';
import { useFirestoreData } from '@/hooks/useFirestoreData';

const outcomeLabels: Record<CallRecord['outcome'], string> = {
  answered: 'Atendeu',
  no_answer: 'Não Atendeu',
  voicemail: 'Caixa Postal',
  busy: 'Ocupado',
  callback: 'Retornar',
};

const Reports = () => {
  const { calls, loading } = useFirestoreData();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCalls = calls.filter(c => c.date.toISOString().split('T')[0] === date);
  const answered = filteredCalls.filter(c => c.outcome === 'answered').length;
  const totalDuration = filteredCalls.reduce((sum, c) => sum + c.duration, 0);

  const handleExport = () => {
    const header = 'Cliente,Resultado,Duração (min),Observações,Próxima Ação\n';
    const rows = filteredCalls.map(c =>
      `"${c.clientName}","${outcomeLabels[c.outcome]}",${c.duration},"${c.notes}","${c.nextAction || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-ligacoes-${date}.csv`;
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
          <p className="text-sm text-muted-foreground">Relatório diário de ligações</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredCalls.length === 0}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{filteredCalls.length}</p>
          <p className="text-xs text-muted-foreground">Total Ligações</p>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <PhoneOff className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold">{answered}</p>
          <p className="text-xs text-muted-foreground">Atendidas</p>
        </div>
        <div className="bg-card rounded-xl p-5 card-shadow text-center">
          <Clock className="w-6 h-6 text-info mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalDuration}min</p>
          <p className="text-xs text-muted-foreground">Tempo Total</p>
        </div>
      </div>

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
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Observações</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Próxima Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCalls.map(call => (
                  <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{call.clientName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{outcomeLabels[call.outcome]}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{call.duration > 0 ? `${call.duration} min` : '--'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell max-w-xs truncate">{call.notes}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{call.nextAction || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma ligação registrada nesta data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
