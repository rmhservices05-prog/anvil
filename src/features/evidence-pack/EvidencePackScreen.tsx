import { SectionHeader } from '../../components/SectionHeader';
import { EvidenceSummary } from '../../components/EvidenceSummary';
import { SimulationState } from '../../types';
import { Card, Badge } from '../../components/ui';

export function EvidencePackScreen({
  state,
  onExport,
}: {
  state: SimulationState;
  onExport: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Evidence Pack"
        title="Export-ready validation summary"
        description="A polished evidence view for scenario metadata, attack profile, outcomes, guardrail integrity, and timeline highlights."
        tag={state.exportStatus === 'success' ? 'Export complete' : 'Ready'}
      />
      <EvidenceSummary onExport={onExport} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="space-y-3">
          <div className="micro-label">Scenario metadata</div>
          <div className="text-sm text-slate-300">{state.scenario.title}</div>
          <div className="text-sm text-slate-400">{state.scenario.subtitle}</div>
        </Card>
        <Card className="space-y-3">
          <div className="micro-label">Attack profile</div>
          <div className="flex flex-wrap gap-2">
            {state.attackTypes.map((attack) => <Badge key={attack} tone="danger">{attack.replace('-', ' ')}</Badge>)}
          </div>
        </Card>
        <Card className="space-y-3">
          <div className="micro-label">Outcome summary</div>
          <div className="text-sm leading-6 text-slate-300">{state.headline}</div>
        </Card>
      </div>
    </div>
  );
}
