import { AttackEvent } from '../types';
import { Badge, Card } from './ui';
import { cn } from '../lib/utils';

export function AttackLog({
  events,
  onSelect,
}: {
  events: AttackEvent[];
  onSelect?: (event: AttackEvent) => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="micro-label">Event log</div>
          <div className="text-[13px] font-medium text-[#f3f3f3]">Timestamped command and link events</div>
        </div>
        <Badge tone="muted">Live feed</Badge>
      </div>
      <div className="thin-scrollbar max-h-[420px] overflow-auto pr-1">
        <div className="min-w-[700px]">
          <div className="sticky top-0 z-[1] grid grid-cols-[90px_120px_minmax(0,1fr)_120px_100px] gap-2 border-b border-white/[0.06] bg-[#171717] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c]">
          <span>Time</span>
          <span>Severity</span>
          <span>Event</span>
          <span>Source</span>
          <span className="text-right">Impact</span>
          </div>
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onSelect?.(event)}
              className={cn(
                'grid w-full grid-cols-[90px_120px_minmax(0,1fr)_120px_100px] gap-2 border-b border-white/[0.05] px-3 py-2 text-left transition hover:bg-white/[0.03]',
                'focus:outline-none focus:bg-white/[0.04]',
              )}
            >
              <span className="font-mono text-[11px] text-[#8c8c8c]">{event.time}</span>
              <span
                className={cn(
                  'inline-flex w-fit items-center rounded-[4px] border px-2 py-1 text-[10px] uppercase tracking-[0.12em]',
                  event.severity === 'critical'
                    ? 'border-[#6d3a38] bg-[#241716] text-[#e28a86]'
                    : event.severity === 'high'
                      ? 'border-[#6b5323] bg-[#241d11] text-[#e0b466]'
                      : event.severity === 'medium'
                        ? 'border-[#6b5323] bg-[#241d11] text-[#e0b466]'
                        : 'border-white/[0.08] bg-[#151515] text-[#bdbdbd]',
                )}
              >
                {event.severity}
              </span>
              <span className="min-w-0 truncate text-[12px] text-[#f3f3f3]">{event.message}</span>
              <span className="truncate text-[12px] text-[#8c8c8c]">{event.source}</span>
              <span className={cn('font-mono text-[12px] text-right', event.trustImpact >= 0 ? 'text-[#72c8a0]' : 'text-[#e28a86]')}>
                {event.trustImpact > 0 ? '+' : ''}
                {event.trustImpact}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
