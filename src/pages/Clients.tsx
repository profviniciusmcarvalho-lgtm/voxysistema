import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, User, Building2, Upload, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import ClientTable from '@/components/ClientTable';
import CallLogDialog from '@/components/CallLogDialog';
import { Client, CallRecord } from '@/types/client';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { toast } from 'sonner';

// Campos esperados no arquivo de importação (case-insensitive)
const FIELD_MAP: Record<string, keyof typeof emptyForm> = {
  nome: 'name', name: 'name',
  tipo: 'type', type: 'type',
  documento: 'document', cpf: 'document', cnpj: 'document', document: 'document',
  email: 'email',
  telefone: 'phone', phone: 'phone', celular: 'phone',
  empresa: 'company', company: 'company', 'razão social': 'company', razao_social: 'company',
  endereço: 'address', endereco: 'address', address: 'address',
  observações: 'notes', observacoes: 'notes', notes: 'notes',
  status: 'status',
};

type ImportRow = { row: number; data: typeof emptyForm; error?: string };

const normalizeType = (v: string): 'cpf' | 'cnpj' => {
  const s = v?.toString().toLowerCase().trim();
  if (s === 'cnpj' || s === 'pj' || s === 'jurídica' || s === 'juridica') return 'cnpj';
  return 'cpf';
};

const normalizeStatus = (v: string): Client['status'] => {
  const s = v?.toString().toLowerCase().trim();
  if (s === 'ativo' || s === 'active') return 'active';
  if (s === 'inativo' || s === 'inactive') return 'inactive';
  return 'prospect';
};

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

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (json.length === 0) { toast.error('Arquivo vazio ou sem dados'); return; }

        const rows: ImportRow[] = json.map((raw, i) => {
          const mapped: any = { ...emptyForm };
          for (const [col, val] of Object.entries(raw)) {
            const key = FIELD_MAP[col.toLowerCase().trim()];
            if (key) mapped[key] = val?.toString().trim() ?? '';
          }
          mapped.type = normalizeType(mapped.type);
          mapped.status = normalizeStatus(mapped.status);
          const error = !mapped.name ? 'Nome obrigatório'
            : !mapped.document ? 'Documento obrigatório'
            : !mapped.phone ? 'Telefone obrigatório'
            : undefined;
          return { row: i + 2, data: mapped, error };
        });

        setImportRows(rows);
        setImportDone(false);
      } catch {
        toast.error('Erro ao ler arquivo. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    const valid = importRows.filter(r => !r.error);
    if (valid.length === 0) { toast.error('Nenhum registro válido para importar'); return; }
    setImporting(true);
    let count = 0;
    for (const row of valid) {
      try {
        await addClient({ ...row.data, createdAt: new Date() });
        count++;
      } catch { /* skip */ }
    }
    setImporting(false);
    setImportDone(true);
    toast.success(`${count} cliente(s) importado(s) com sucesso!`);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['nome', 'tipo', 'documento', 'email', 'telefone', 'empresa', 'endereço', 'observações', 'status'],
      ['João Silva', 'cpf', '000.000.000-00', 'joao@email.com', '(11) 99999-0000', '', 'Rua A, 123', '', 'prospect'],
      ['Empresa LTDA', 'cnpj', '00.000.000/0001-00', 'contato@empresa.com', '(11) 3333-0000', 'Empresa LTDA', 'Av B, 456', '', 'active'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'modelo-importacao-clientes.xlsx');
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setImportRows([]); setImportDone(false); setImportOpen(true); }}>
            <Upload className="w-4 h-4" /> Importar
          </Button>
          <Button className="gap-2" onClick={() => setNewClientOpen(true)}>
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
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

      {/* Dialog: Importar Clientes */}
      <Dialog open={importOpen} onOpenChange={(o) => { setImportOpen(o); if (!o) setImportRows([]); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Clientes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-medium">Colunas aceitas no arquivo:</p>
              <p className="text-xs text-muted-foreground font-mono">nome, tipo (cpf/cnpj), documento, email, telefone, empresa, endereço, observações, status (prospect/ativo/inativo)</p>
              <Button variant="outline" size="sm" className="gap-2 mt-1" onClick={handleDownloadTemplate}>
                <Download className="w-3 h-3" /> Baixar modelo .xlsx
              </Button>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Clique para selecionar o arquivo</p>
              <p className="text-sm text-muted-foreground mt-1">Suporta .xlsx, .xls e .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

            {importRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{importRows.length} registro(s) encontrado(s)</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" />{importRows.filter(r => !r.error).length} válidos</span>
                    <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" />{importRows.filter(r => r.error).length} com erro</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">#</th>
                        <th className="text-left px-3 py-2">Nome</th>
                        <th className="text-left px-3 py-2">Tipo</th>
                        <th className="text-left px-3 py-2">Documento</th>
                        <th className="text-left px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importRows.map((r) => (
                        <tr key={r.row} className={r.error ? 'bg-destructive/5' : ''}>
                          <td className="px-3 py-2 text-muted-foreground">{r.row}</td>
                          <td className="px-3 py-2 font-medium">{r.data.name || <span className="text-destructive italic">vazio</span>}</td>
                          <td className="px-3 py-2 uppercase">{r.data.type}</td>
                          <td className="px-3 py-2">{r.data.document || <span className="text-destructive italic">vazio</span>}</td>
                          <td className="px-3 py-2">
                            {r.error
                              ? <span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-3 h-3" />{r.error}</span>
                              : <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" />OK</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importDone && (
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Importação concluída!
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Fechar</Button>
            {importRows.filter(r => !r.error).length > 0 && !importDone && (
              <Button onClick={handleImportConfirm} disabled={importing}>
                {importing ? 'Importando...' : `Importar ${importRows.filter(r => !r.error).length} cliente(s)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
