import { useState } from 'react';
import { CallRecord, Client } from '@/types/client';
import RecentCalls from '@/components/RecentCalls';
import CallLogDialog from '@/components/CallLogDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Plus } from 'lucide-react';
import { useFirestoreData } from '@/hooks/useFirestoreData';

const Calls = () => {
  const { clients, calls, addCall, loading } = useFirestoreData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSelect, setClientSelect] = useState('');

  const today = new Date().toDateString();
  const todayCalls = calls.filter(c => c.date.toDateString() === today);
  const olderCalls = calls.filter(c => c.date.toDateString() !== today);

  const handleNewCall = () => {
    if (clientSelect) {
      const client = clients.find(c => c.id === clientSelect);
      if (client) {
        setSelectedClient(client);
        setDialogOpen(true);
      }
    }
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
          <Select value={clientSelect} onValueChange={setClientSelect}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={handleNewCall} disabled={!clientSelect}>
            <Plus className="w-4 h-4" /> Registrar
          </Button>
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
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ligação registrada hoje</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Dias Anteriores ({olderCalls.length})</h2>
          {olderCalls.length > 0 ? (
            <RecentCalls calls={olderCalls} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ligação anterior</p>
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
