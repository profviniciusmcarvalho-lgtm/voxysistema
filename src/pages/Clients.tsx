import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, User, Building2 } from 'lucide-react';
import ClientTable from '@/components/ClientTable';
import CallLogDialog from '@/components/CallLogDialog';
import { Client, CallRecord } from '@/types/client';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { toast } from 'sonner';

const emptyForm = {
  name: '', type: 'cpf' as 'cpf' | 'cnpj', document: '', email: '',
  phone: '', company: '', address: '', notes: '', status: 'prospect' as Client['status'],
};

const Clients = () => {
  const { clients, addCall, addClient, deleteClient, loading } = useFirestoreData();
  const [search, setSearch] = useState('');
  const [callClient, setCallClient] = useState<Client | null>(null);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filter = (c: Client) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.document.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase());

  const cpfClients = clients.filter(c => c.type === 'cpf' && filter(c));
  const cnpjClients = clients.filter(c => c.type === 'cnpj' && filter(c));

  const handleSaveCall = async (call: CallRecord) => {
    const { id, ...rest } = call;
    await addCall(rest);
  };

  const handleSaveClient = async () => {
    if (!form.name || !form.document || !form.email || !form.phone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await addClient({ ...form, createdAt: new Date() });
      toast.success('Cliente cadastrado com sucesso!');
      setForm(emptyForm);
      setNewClientOpen(false);
    } catch {
      toast.error('Erro ao cadastrar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id);
      toast.success('Cliente removido');
    } catch {
      toast.error('Erro ao remover cliente');
    } finally {
      setDeleteTarget(null);
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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <Button className="gap-2" onClick={() => setNewClientOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, documento ou email..."
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
            <ClientTable clients={cpfClients} onCall={(c) => setCallClient(c)} onDelete={(c) => setDeleteTarget(c)} />
          </div>
        </TabsContent>

        <TabsContent value="cnpj" className="mt-4">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <ClientTable clients={cnpjClients} onCall={(c) => setCallClient(c)} onDelete={(c) => setDeleteTarget(c)} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Novo Cliente */}
      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as 'cpf' | 'cnpj' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">Pessoa Física (CPF)</SelectItem>
                    <SelectItem value="cnpj">Pessoa Jurídica (CNPJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status <span className="text-destructive">*</span></Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Client['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome completo <span className="text-destructive">*</span></Label>
              <Input placeholder="Nome do cliente" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{form.type === 'cpf' ? 'CPF' : 'CNPJ'} <span className="text-destructive">*</span></Label>
                <Input placeholder={form.type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'} value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefone <span className="text-destructive">*</span></Label>
                <Input placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            {form.type === 'cnpj' && (
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input placeholder="Razão social" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input placeholder="Rua, número, cidade..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input placeholder="Notas adicionais..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewClientOpen(false); setForm(emptyForm); }}>Cancelar</Button>
            <Button onClick={handleSaveClient} disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              O cliente <strong>{deleteTarget?.name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
