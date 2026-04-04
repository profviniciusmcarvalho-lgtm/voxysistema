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

const CallLogDialog = ({ client, open, onOpenChange, onSave }: CallLogDialogProps) => {
  const [outcome, setOutcome] = useState<CallRecord['outcome']>('answered');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Ligação</DialogTitle>
        </DialogHeader>
        {client && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium text-sm">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
            </div>

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
