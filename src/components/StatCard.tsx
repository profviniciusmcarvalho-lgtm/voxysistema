import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'primary' | 'secondary';
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const bgClass = variant === 'primary'
    ? 'gradient-primary text-primary-foreground'
    : variant === 'secondary'
    ? 'gradient-secondary text-secondary-foreground'
    : 'bg-card text-card-foreground';

  const subtitleClass = variant === 'default' ? 'text-muted-foreground' : 'opacity-80';

  return (
    <div className={`rounded-xl p-5 card-shadow transition-transform hover:scale-[1.02] ${bgClass}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wider ${subtitleClass}`}>{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className={`text-xs ${subtitleClass}`}>{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs ontem
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${variant === 'default' ? 'bg-accent' : 'bg-white/15'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
