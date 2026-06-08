import { LineageBranch } from '../types';
import { Badge, Card } from './ui';
import { cn } from '../lib/utils';

export function LineageGraph({
  branches,
  onSelect,
}: {
  branches: LineageBranch[];
  onSelect: (branch: LineageBranch) => void;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="micro-label">Lineage graph</div>
          <div className="text-base font-semibold text-white">Branch continuity across verified, rejected, and recovery epochs</div>
        </div>
        <Badge tone="amber">Epoch ledger</Badge>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-black/20 p-4">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative flex h-[280px] items-center">
          {branches.map((branch, index) => (
            <div key={branch.id} className="relative flex-1">
              {branch.parentId ? <div className={cn('absolute left-0 top-1/2 h-px w-full -translate-y-1/2', branch.status === 'rejected' ? 'bg-hostile/40' : branch.status === 'recovery' ? 'bg-trust/60' : 'bg-white/10')} /> : null}
              <button
                onClick={() => onSelect(branch)}
                className={cn(
                  'relative mx-auto block h-24 w-24 rounded-full border transition hover:scale-105',
                  branch.status === 'verified'
                    ? 'border-trust/40 bg-trust/10'
                    : branch.status === 'active'
                      ? 'border-amber-400/50 bg-amber-500/15'
                      : branch.status === 'recovery'
                        ? 'border-trust/40 bg-trust/15'
                        : branch.status === 'quarantined'
                          ? 'border-hostile/40 bg-hostile/10'
                          : 'border-white/8 bg-white/5',
                )}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs font-semibold text-white">{branch.epoch}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-400">{branch.status}</div>
                </div>
              </button>
              <div className={cn('mt-3 text-center text-xs text-slate-400', index % 2 ? 'translate-y-1' : '')}>{branch.acceptanceReason}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {branches.slice(0, 4).map((branch) => (
          <button key={branch.id} onClick={() => onSelect(branch)} className="rounded-xl border border-white/6 bg-white/3 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{branch.epoch}</div>
              <Badge tone={branch.status === 'verified' ? 'success' : branch.status === 'recovery' ? 'amber' : branch.status === 'quarantined' ? 'danger' : 'warn'}>{branch.status}</Badge>
            </div>
            <div className="mt-2 text-xs text-slate-400">Trust {branch.trust}% · {branch.successorState}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}
