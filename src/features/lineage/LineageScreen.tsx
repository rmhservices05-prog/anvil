import { SectionHeader } from '../../components/SectionHeader';
import { LineageGraph } from '../../components/LineageGraph';
import { Card, Badge, Button } from '../../components/ui';
import { LineageBranch, SimulationState } from '../../types';
import { Workflow } from 'lucide-react';

export function LineageScreen({
  state,
  onSelect,
  onFilter,
}: {
  state: SimulationState;
  onSelect: (branch: LineageBranch) => void;
  onFilter: (status: LineageBranch['status'] | 'all') => void;
}) {
  const filter = state.layout.filters.lineage ?? 'all';
  const selectedBranch = state.selectedDetail?.type === 'branch' ? state.lineageBranches.find((branch) => branch.id === state.selectedDetail?.id) : undefined;
  const branches = filter === 'all' ? state.lineageBranches : state.lineageBranches.filter((branch) => branch.status === filter);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Lineage"
        title="Inspectable operational ledger"
        description="Branch selection, filtering, and state changes stay tied to the live session so the ledger reflects what the operator actually did."
        tag={filter === 'all' ? 'all branches' : filter}
        icon={<Workflow size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                <Workflow size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
              </span>
              <div className="micro-label">Branch filters</div>
            </div>
            <div className="text-base font-semibold text-white">Show verified, active, stale, rejected, or recovery states</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'verified', 'active', 'stale', 'rejected', 'recovery', 'quarantined'] as const).map((item) => (
              <Button key={item} variant={filter === item ? 'amber' : 'outline'} selected={filter === item} onClick={() => onFilter(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">Verified</Badge>
          <Badge tone="amber">Active</Badge>
          <Badge tone="warn">Stale</Badge>
          <Badge tone="danger">Rejected</Badge>
          <Badge tone="amber">Recovery</Badge>
        </div>
      </Card>

      <LineageGraph branches={branches} selectedBranchId={selectedBranch?.id} onSelect={onSelect} />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-3">
          <div className="micro-label">Selected branch</div>
          {selectedBranch ? (
            <>
              <div className="text-lg font-semibold text-white">{selectedBranch.epoch}</div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={selectedBranch.status === 'verified' ? 'success' : selectedBranch.status === 'recovery' ? 'amber' : selectedBranch.status === 'quarantined' ? 'danger' : 'warn'}>
                  {selectedBranch.status}
                </Badge>
                <Badge tone="muted">{selectedBranch.trust}% trust</Badge>
              </div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3 text-sm leading-6 text-slate-300">{selectedBranch.acceptanceReason}</div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3 text-sm leading-6 text-slate-300">{selectedBranch.successorState}</div>
            </>
          ) : (
            <div className="text-sm leading-6 text-slate-400">Select a branch in the graph to inspect its history and state transitions.</div>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="micro-label">Branch history</div>
          <div className="space-y-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => onSelect(branch)}
                className="w-full rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{branch.epoch}</div>
                  <Badge tone={branch.status === 'verified' ? 'success' : branch.status === 'recovery' ? 'amber' : branch.status === 'quarantined' ? 'danger' : 'warn'}>
                    {branch.status}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-slate-400">Trust {branch.trust}% · {branch.successorState}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{branch.acceptanceReason}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
