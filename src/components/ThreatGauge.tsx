import { cn } from '../lib/utils';

export function ThreatGauge({ value }: { value: number }) {
  const level = value < 30 ? 'low' : value < 60 ? 'moderate' : 'high';
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div>
          <div className="micro-label">Threat pressure</div>
          <div className="mt-1 font-mono text-[28px] leading-none text-[#f3f3f3]">{Math.round(value)}</div>
        </div>
        <div className={cn('text-[10px] uppercase tracking-[0.18em]', level === 'high' ? 'text-[#e28a86]' : level === 'moderate' ? 'text-[#e0b466]' : 'text-[#72c8a0]')}>
          {level}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#8c8c8c]">
          <span>Pressure index</span>
          <span>{Math.round(value)} / 100</span>
        </div>
        <div
          className={cn(
            'h-2 w-full overflow-hidden rounded-[2px] bg-white/[0.06]',
          )}
        >
          <div
            className={cn(
              'h-full rounded-[2px] transition-all',
              level === 'high' ? 'bg-[#d95c59]' : level === 'moderate' ? 'bg-[#d7a84b]' : 'bg-[#36b37e]',
            )}
            style={{ width: `${Math.max(8, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
