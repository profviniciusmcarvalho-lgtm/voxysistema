import { useState, useMemo } from 'react';
import { CallRecord, Client } from '@/types/client';
import RecentCalls from '@/components/RecentCalls';
import CallLogDialog from '@/components/CallLogDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Plus, PhoneOff, TrendingUp, Search, X, Download } from 'lucide-react';
import { useFirestoreData } from '@/hooks/useFirestoreData';

const outcomeLabel: Record<string, string> = {
  answered: 'Atendida',
  no_answer: 'Sem resposta',
  voicemail: 'Caixa postal',
  busy: 'Ocupado',
  callback: 'A retornar',
};

const exportCallsToCSV = (calls: CallRecord[]) => {
  const header = ['Data', 'Hora', 'Cliente', 'Duração (min)', 'Resultado', 'Observações', 'Próxima ação'];
  const rows = calls.map(c => [
    c.date.toLocaleDateString('pt-BR'),
    c.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    c.clientName,
    c.duration,
    outcomeLabel[c.outcome] ?? c.outcome,
    `"${(c.notes ?? '').replace(/"/g, '""')}"`,
    `"${(c.nextAction ?? '').replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ligacoes_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const groupByDate = (calls: CallRecord[]) => {
  const groups: Record<string, CallRecord[]> = {};
  calls.forEach(c => {
    const key = c.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return groups;
};

const Calls = () => {
  const { clients, calls, addCall, loading } = useFirestoreData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const today = new Date().toDateString();
  const todayCalls = calls.filter(c => c.date.toDateString() === today);
  const olderCalls = calls.filter(c => c.date.toDateString() !== today);
  const olderGroups = groupByDate(olderCalls);

  const answeredToday = todayCalls.filter(c => c.outcome === 'answered').length;
  const pendingToday = todayCalls.filter(c => c.outcome === 'callback').length;

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.document.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    ).slice(0, 8);
  }, [clients, clientSearch]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowSuggestions(false);
  };

  const handleNewCall = () => {
    if (selectedClient) {
      setDialogOpen(true);
    }
  };

  const clearClientSearch = () => {
    setClientSearch('');
    setSelectedClient(null);
    setShowSuggestions(false);
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
          <h1 className="text-2xl font-bold">Ligações</h1>
          <p className="text-sm text-muted-foreground">Controle de ligações diárias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportCallsToCSV(calls)} disabled={calls.length === 0}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 pr-8"
              placeholder="Buscar por nome ou CPF/CNPJ..."
              value={clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setSelectedClient(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {clientSearch && (
              <button onClick={clearClientSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            {showSuggestions && filteredClients.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors"
                    onMouseDown={() => handleSelectClient(c)}
                  >
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.document} · {c.phone}</p>
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && clientSearch.trim() && filteredClients.length === 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
          <Button className="gap-2" onClick={handleNewCall} disabled={!selectedClient}>
            <Plus className="w-4 h-4" /> Registrar
          </Button>
        </div>
      </div>

      {/* Resumo do dia */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <Phone className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{todayCalls.length}</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xl font-bold">{answeredToday}</p>
          <p className="text-xs text-muted-foreground">Atendidas</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <PhoneOff className="w-5 h-5 text-info mx-auto mb-1" />
          <p className="text-xl font-bold">{pendingToday}</p>
          <p className="text-xs text-muted-foreground">A Retornar</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Hoje ({todayCalls.length})</h2>
          </div>
          {todayCalls.length > 0 ? (
            <RecentCalls calls={todayCalls} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Phone className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma ligação registrada hoje</p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Dias Anteriores ({olderCalls.length})</h2>
          {Object.keys(olderGroups).length > 0 ? (
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
              {Object.entries(olderGroups).map(([date, dateCalls]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{date}</p>
                  <RecentCalls calls={dateCalls} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Phone className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma ligação anterior</p>
            </div>
          )}
        </div>
      </div>

      <CallLogDialog
        client={selectedClient}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (call) => {
          const { id, ...rest } = call;
          await addCall(rest);
        }}
      />
    </div>
  );
};

export default Calls;
