import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, User, Building2 } from 'lucide-react';
import ClientTable from '@/components/ClientTable';
import CallLogDialog from '@/components/CallLogDialog';
import { Client, CallRecord } from '@/types/client';
import { useFirestoreData } from '@/hooks/useFirestoreData';

const Clients = () => {
  const { clients, addCall, loading } = useFirestoreData();
  const [search, setSearch] = useState('');
  const [callClient, setCallClient] = useState<Client | null>(null);

  const cpfClients = clients.filter(c => c.type === 'cpf' && (c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search)));
  const cnpjClients = clients.filter(c => c.type === 'cnpj' && (c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search)));

  const handleSaveCall = async (call: CallRecord) => {
    const { id, ...rest } = call;
    await addCall(rest);
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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua carteira de clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou documento..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="cpf" className="w-full">
        <TabsList>
          <TabsTrigger value="cpf" className="gap-2">
            <User className="w-4 h-4" /> Pessoa Física ({cpfClients.length})
          </TabsTrigger>
          <TabsTrigger value="cnpj" className="gap-2">
            <Building2 className="w-4 h-4" /> Pessoa Jurídica ({cnpjClients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cpf" className="mt-4">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <ClientTable clients={cpfClients} onCall={(c) => setCallClient(c)} />
          </div>
        </TabsContent>

        <TabsContent value="cnpj" className="mt-4">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <ClientTable clients={cnpjClients} onCall={(c) => setCallClient(c)} />
          </div>
        </TabsContent>
      </Tabs>

      <CallLogDialog
        client={callClient}
        open={!!callClient}
        onOpenChange={(open) => !open && setCallClient(null)}
        onSave={handleSaveCall}
      />
    </div>
  );
};

export default Clients;
