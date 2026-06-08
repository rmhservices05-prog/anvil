import { cn } from '../lib/utils';

export function ThreatGauge({ value }: { value: number }) {
  const level = value < 30 ? 'low' : value < 60 ? 'moderate' : 'high';
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="micro-label">Threat pressure</div>
          <div className="mt-1 text-2xl font-semibold text-white">{Math.round(value)}</div>
        </div>
        <div className={cn('text-xs uppercase tracking-[0.24em]', level === 'high' ? 'text-hostile' : level === 'moderate' ? 'text-amber-200' : 'text-trust')}>
          {level}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            level === 'high' ? 'bg-gradient-to-r from-hostile to-amber-300' : level === 'moderate' ? 'bg-gradient-to-r from-amber-500 to-amber-200' : 'bg-gradient-to-r from-trust to-emerald-200',
          )}
          style={{ width: `${Math.max(8, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
