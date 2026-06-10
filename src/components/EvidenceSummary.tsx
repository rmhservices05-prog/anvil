import { Badge, Card, Button } from './ui';
import { SimulationState } from '../types';
import { FileText } from 'lucide-react';

export function EvidenceSummary({ state, onExport }: { state: SimulationState; onExport: () => void }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <FileText size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Evidence pack</div>
          </div>
          <div className="text-base font-semibold text-white">Export-ready summary for stakeholders and operators</div>
        </div>
        <Badge tone={state.exportStatus === 'success' ? 'success' : 'amber'}>{state.exportStatus === 'success' ? 'Exported' : 'Ready'}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/6 bg-black/20 p-4">
          <div className="micro-label">Scenario metadata</div>
          <p className="mt-2 text-sm text-slate-300">{state.scenario.title} · {state.scenario.subtitle}</p>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/20 p-4">
          <div className="micro-label">Command authority verdict</div>
          <p className="mt-2 text-sm text-slate-300">{state.headline} · {state.metrics.authorityState} authority, {state.metrics.guardrailLock} guardrails.</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/6 bg-black/20 p-4">
        <div className="micro-label">Operator notes</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The artifact is generated locally from the current runtime. It contains the session timeline, alert states, metrics, and selected detail so the export can be replayed later without backend dependencies.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="amber" onClick={onExport}>Export evidence pack</Button>
        <Badge tone="amber">{state.summary.evidenceCount} evidence items</Badge>
        <Badge tone="success">{state.summary.alertCount} alerts</Badge>
        <Badge tone="warn">{state.summary.sessionPhase}</Badge>
      </div>
    </Card>
  );
}
