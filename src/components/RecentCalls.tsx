import { CallRecord } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, PhoneMissed, Voicemail, Clock } from 'lucide-react';

interface RecentCallsProps {
  calls: CallRecord[];
  showDate?: boolean;
}

const outcomeConfig: Record<CallRecord['outcome'], { label: string; icon: typeof Phone; className: string }> = {
  answered: { label: 'Atendeu', icon: Phone, className: 'text-success' },
  no_answer: { label: 'Não Atendeu', icon: PhoneMissed, className: 'text-destructive' },
  voicemail: { label: 'Caixa Postal', icon: Voicemail, className: 'text-warning' },
  busy: { label: 'Ocupado', icon: PhoneOff, className: 'text-muted-foreground' },
  callback: { label: 'Retornar', icon: Clock, className: 'text-info' },
};

const RecentCalls = ({ calls, showDate = false }: RecentCallsProps) => {
  return (
    <div className="space-y-3">
      {calls.map((call) => {
        const config = outcomeConfig[call.outcome];
        const Icon = config.icon;
        return (
          <div key={call.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className={`p-2 rounded-lg bg-background ${config.className}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{call.clientName}</p>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {showDate && (
                    <span className="text-xs text-muted-foreground">
                      {call.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {call.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {call.duration > 0 && (
                    <span className="text-xs text-muted-foreground">{call.duration}min</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{call.notes}</p>
              {call.nextAction && (
                <Badge variant="outline" className="mt-1.5 text-xs">
                  → {call.nextAction}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentCalls;
