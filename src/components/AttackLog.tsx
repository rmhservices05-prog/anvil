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
      <div className="flex items-center justify-between">
        <div>
          <div className="micro-label">Event log</div>
          <div className="text-base font-semibold text-white">Timestamped command and link events</div>
        </div>
        <Badge tone="warn">Live feed</Badge>
      </div>
      <div className="thin-scrollbar max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelect?.(event)}
            className={cn(
              'w-full rounded-xl border border-white/6 bg-black/20 px-3 py-3 text-left transition hover:border-amber-500/30 hover:bg-white/5',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/30',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', event.severity === 'critical' ? 'bg-hostile' : event.severity === 'high' ? 'bg-amber-400' : event.severity === 'medium' ? 'bg-amber-200' : 'bg-trust')} />
                <span className="text-sm font-medium text-slate-100">{event.message}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{event.time}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>Source: {event.source}</span>
              <span>Severity: {event.severity}</span>
              <span className={event.trustImpact >= 0 ? 'text-trust' : 'text-hostile'}>
                Trust impact: {event.trustImpact > 0 ? '+' : ''}
                {event.trustImpact}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
