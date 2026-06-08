import { Badge, Card, Button } from './ui';

export function EvidenceSummary({ onExport }: { onExport: () => void }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Evidence pack</div>
          <div className="text-base font-semibold text-white">Export-ready summary for stakeholders and operators</div>
        </div>
        <Badge tone="success">Export simulated</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/6 bg-black/20 p-4">
          <div className="micro-label">Scenario metadata</div>
          <p className="mt-2 text-sm text-slate-300">Contested-spectrum validation under AI-generated attack chains with guarded fallback authority and recovery lineage.</p>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/20 p-4">
          <div className="micro-label">Command authority verdict</div>
          <p className="mt-2 text-sm text-slate-300">Trusted authority continuity retained at the system level, with fail-secure fallback engaged only when hostile pressure exceeded verified thresholds.</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/6 bg-black/20 p-4">
        <div className="micro-label">Operator notes</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The console is evidence-oriented, not promotional. It shows how Lineage / DQSP keeps command authority trustworthy when the channel is contaminated, delayed, or actively manipulated.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="amber" onClick={onExport}>Export evidence pack</Button>
        <Badge tone="amber">Scenario metadata</Badge>
        <Badge tone="success">Integrity verdict</Badge>
        <Badge tone="warn">Timeline highlights</Badge>
      </div>
    </Card>
  );
}
