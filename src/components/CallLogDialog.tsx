import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Client, CallRecord } from '@/types/client';
import { toast } from 'sonner';

interface CallLogDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (call: CallRecord) => void;
}

const outcomeLabels: Record<CallRecord['outcome'], string> = {
  answered: 'Atendeu',
  no_answer: 'Não Atendeu',
  voicemail: 'Caixa Postal',
  busy: 'Ocupado',
  callback: 'Retornar',
};

const WA_TEMPLATES = [
  { label: 'Retorno de ligação', text: 'Olá {nome}! Tentei falar com você, mas não consegui. Pode me retornar?' },
  { label: 'Confirmação de contato', text: 'Olá {nome}! Foi um prazer falar com você. Qualquer dúvida, estou à disposição!' },
  { label: 'Proposta', text: 'Olá {nome}! Conforme alinhado, estou enviando a proposta. Fico aguardando seu retorno!' },
  { label: 'Lembrete', text: 'Olá {nome}! Passando para lembrar do nosso agendamento. Até logo!' },
];

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

const CallLogDialog = ({ client, open, onOpenChange, onSave }: CallLogDialogProps) => {
  const [outcome, setOutcome] = useState<CallRecord['outcome']>('answered');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [showWA, setShowWA] = useState(false);

  const handleSave = () => {
    if (!client) return;
    const call: CallRecord = {
      id: crypto.randomUUID(),
      clientId: client.id,
      clientName: client.name,
      date: new Date(),
      duration: parseInt(duration) || 0,
      outcome,
      notes,
      nextAction: nextAction || undefined,
    };
    onSave(call);
    toast.success('Ligação registrada com sucesso!');
    setOutcome('answered');
    setDuration('');
    setNotes('');
    setNextAction('');
    setWaMessage('');
    setShowWA(false);
    onOpenChange(false);
  };

  const handleSendWhatsApp = () => {
    if (!client) return;
    const phone = sanitizePhone(client.phone);
    if (!phone) { toast.error('Cliente sem número de telefone'); return; }
    const text = encodeURIComponent(waMessage.replace('{nome}', client.name.split(' ')[0]));
    window.open(`https://wa.me/55${phone}?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setShowWA(false); setWaMessage(''); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Ligação</DialogTitle>
        </DialogHeader>
        {client && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.phone} · {client.document}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10 hover:text-[#25D366]"
                onClick={() => setShowWA(!showWA)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            </div>

            {showWA && (
              <div className="space-y-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 p-3">
                <p className="text-xs font-semibold text-[#128C7E]">Mensagem WhatsApp</p>
                <div className="flex flex-wrap gap-1">
                  {WA_TEMPLATES.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      className="text-xs px-2 py-1 rounded-md bg-background border border-border hover:border-[#25D366]/60 transition-colors"
                      onClick={() => setWaMessage(t.text)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  rows={3}
                  placeholder="Digite a mensagem... use {nome} para o nome do cliente"
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                  disabled={!waMessage.trim()}
                  onClick={handleSendWhatsApp}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar no WhatsApp
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resultado</Label>
                <Select value={outcome} onValueChange={(v) => setOutcome(v as CallRecord['outcome'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(outcomeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" placeholder="0" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Detalhes da ligação..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Próxima ação</Label>
              <Input placeholder="Ex: Enviar proposta, retornar amanhã..." value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallLogDialog;
