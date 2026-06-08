import { SectionHeader } from '../../components/SectionHeader';
import { LineageGraph } from '../../components/LineageGraph';
import { Card, Badge } from '../../components/ui';
import { SimulationState, LineageBranch } from '../../types';

export function LineageScreen({
  state,
  onSelect,
}: {
  state: SimulationState;
  onSelect: (branch: LineageBranch) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Lineage Graph"
        title="Cryptographic and control lineage continuity"
        description="Visualize accepted epochs, stale branches, quarantined branches, and recovery continuity without exposing unsafe rollback."
        tag="Lineage continuity"
      />
      <LineageGraph branches={state.lineageBranches} onSelect={onSelect} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="space-y-3">
          <div className="micro-label">How it behaves</div>
          <p className="text-sm leading-6 text-slate-300">Public epoch accepted. Local state advances on verified input. Invalid or stale inputs are rejected. Branch continuity is maintained without unsafe rollback.</p>
        </Card>
        <Card className="space-y-3">
          <div className="micro-label">State classes</div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Verified</Badge>
            <Badge tone="amber">Active</Badge>
            <Badge tone="warn">Stale</Badge>
            <Badge tone="danger">Rejected</Badge>
          </div>
        </Card>
        <Card className="space-y-3">
          <div className="micro-label">Recovery branch</div>
          <p className="text-sm leading-6 text-slate-300">When authority is contested, a verified recovery branch can be activated while preserving the last known-good control state.</p>
        </Card>
      </div>
    </div>
  );
}
