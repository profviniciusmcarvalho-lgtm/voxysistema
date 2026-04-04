import { Client } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientTableProps {
  clients: Client[];
  onCall?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

const statusMap: Record<Client['status'], { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-border' },
  prospect: { label: 'Prospect', className: 'bg-info/10 text-info border-info/20' },
};

const ClientTable = ({ clients, onCall, onDelete }: ClientTableProps) => {
  if (clients.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">Nenhum cliente encontrado</p>
        <p className="text-xs mt-1">Cadastre um novo cliente ou ajuste a busca</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Documento</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Contato</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clients.map((client) => {
            const status = statusMap[client.status];
            return (
              <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground font-mono">{client.document}</span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {client.email}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {client.phone}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className={status.className}>{status.label}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onCall?.(client)}>
                      <Phone className="w-3.5 h-3.5" /> Ligar
                    </Button>
                    {onDelete && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2" onClick={() => onDelete(client)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
