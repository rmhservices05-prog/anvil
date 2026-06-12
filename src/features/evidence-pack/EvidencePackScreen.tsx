import { SectionHeader } from '../../components/SectionHeader';
import { EvidenceSummary } from '../../components/EvidenceSummary';
import { SimulationState } from '../../types';
import { Card, Badge, Button } from '../../components/ui';
import { FileText, FileDown } from 'lucide-react';

export function EvidencePackScreen({
  state,
  onExport,
  onSelectEvidence,
}: {
  state: SimulationState;
  onExport: () => void;
  onSelectEvidence: (id: string) => void;
}) {
  const selectedEvidence = state.selectedDetail?.type === 'evidence' ? state.evidence.find((item) => item.id === state.selectedDetail?.id) : undefined;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Evidence Pack"
        title="Real local export surface"
        description="Export the current session as local JSON."
        tag={state.exportStatus === 'success' ? 'Export complete' : 'Ready'}
        icon={<FileText size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />

      <EvidenceSummary state={state} onExport={onExport} />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <FileText size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Session summary</div>
              </div>
              <div className="text-base font-semibold text-white">{state.scenario.title}</div>
            </div>
            <Badge tone={state.exportStatus === 'success' ? 'success' : 'amber'}>{state.exportStatus === 'success' ? 'exported' : 'ready'}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryTile label="Session" value={state.session.id} />
            <SummaryTile label="Phase" value={state.session.phase} />
            <SummaryTile label="Connection" value={state.connectionState} />
            <SummaryTile label="Alerts" value={`${state.summary.alertCount}`} />
          </div>
          <div className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="micro-label">Timeline highlights</div>
            <div className="mt-2 space-y-2">
              {state.timeline.slice(-4).reverse().map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelectEvidence(state.evidence.find((item) => item.source === 'timeline')?.id ?? state.evidence[0]?.id ?? '')}
                  className="w-full rounded-xl border border-white/6 bg-[#141414] p-3 text-left transition hover:border-amber-500/30 hover:bg-[#181818]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{entry.timestamp}</div>
                    <Badge tone={entry.severity === 'critical' ? 'danger' : entry.severity === 'warn' ? 'warn' : 'success'}>{entry.type}</Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{entry.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">{entry.details}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <FileText size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Evidence inspection</div>
              </div>
              <div className="text-base font-semibold text-white">Selected evidence item</div>
            </div>
            <Button variant="amber" onClick={onExport}>
              <FileDown size={15} className="text-[#4f8cff]" />
              Download JSON
            </Button>
          </div>
          {selectedEvidence ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-lg font-semibold text-white">{selectedEvidence.title}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{selectedEvidence.timestamp}</div>
                <div className="mt-3 text-sm leading-6 text-slate-300">{selectedEvidence.summary}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SummaryTile label="Category" value={selectedEvidence.category} />
                <SummaryTile label="Severity" value={selectedEvidence.severity} />
                <SummaryTile label="Source" value={selectedEvidence.source} />
                <SummaryTile label="ID" value={selectedEvidence.id} />
              </div>
              <div className="rounded-xl border border-white/6 bg-black/20 p-3 text-sm leading-6 text-slate-300">{selectedEvidence.details}</div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/6 bg-black/20 p-3 text-sm leading-6 text-slate-400">
              Select an item from the session or choose one below.
            </div>
          )}

          <div className="space-y-2">
            <div className="micro-label">All evidence items</div>
            {state.evidence.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectEvidence(item.id)}
                className="w-full rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <Badge tone={item.severity === 'critical' ? 'danger' : item.severity === 'warn' ? 'warn' : 'success'}>{item.category}</Badge>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{item.summary}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
            <FileText size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
          </span>
          <div className="micro-label">Acknowledgements and export status</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.consoleAlerts.map((alert) => (
            <Badge key={alert.id} tone={alert.acknowledged ? 'success' : alert.level === 'critical' ? 'danger' : 'warn'}>
              {alert.acknowledged ? 'acked' : alert.title}
            </Badge>
          ))}
        </div>
        <div className="text-sm leading-6 text-slate-300">
          {state.exportStatus === 'success'
            ? 'Local JSON export is ready.'
            : 'Export is ready. Download JSON to create the current snapshot.'}
        </div>
      </Card>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
