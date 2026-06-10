import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge, Button } from '../../components/ui';
import { SimulationState } from '../../types';
import { Shield } from 'lucide-react';

export function GuardrailsScreen({
  state,
  onAcknowledge,
  onSelectEvent,
}: {
  state: SimulationState;
  onAcknowledge: (id: string) => void;
  onSelectEvent: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guardrails"
        title="Live policy surface"
        description="Violations, recovery transitions, acknowledgements, and retained assertions all remain visible as the session changes."
        tag={state.metrics.guardrailLock}
        icon={<Shield size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />

      <div className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Live guardrail status</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={state.metrics.guardrailLock === 'locked' ? 'danger' : state.metrics.guardrailLock === 'contested' ? 'warn' : 'success'}>{state.metrics.guardrailLock}</Badge>
            <Badge tone={state.trustState === 'fail-secure' ? 'danger' : state.trustState === 'recovery' ? 'amber' : 'success'}>{state.trustState}</Badge>
          </div>
          <div className="text-sm leading-6 text-slate-300">
            Guardrails stay retained locally. When trust continuity weakens, the system rejects stale or rewritten authority instead of silently failing open.
          </div>
          <div className="space-y-2">
            {state.guardrails.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <Badge tone={item.state === 'locked' ? 'danger' : item.state === 'retained' ? 'success' : 'warn'}>{item.state}</Badge>
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Violations and recovery</div>
              </div>
              <div className="text-base font-semibold text-white">Acknowledgements feed back into the same runtime</div>
            </div>
            <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
          </div>
          <div className="space-y-2">
            {state.consoleAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">{alert.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{alert.timestamp}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={alert.level === 'critical' ? 'danger' : alert.level === 'warn' ? 'warn' : 'success'}>{alert.level}</Badge>
                    <Button variant="outline" onClick={() => onAcknowledge(alert.id)} disabled={alert.acknowledged}>
                      {alert.acknowledged ? 'Acked' : 'Acknowledge'}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{alert.message}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="micro-label">Why the guardrail is locked, retained, or degraded</div>
            <div className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
              <div>Locked: the runtime has detected a non-negotiable safety condition.</div>
              <div>Retained: the last verified policy is still binding and reusable.</div>
              <div>Degraded: the session is running, but trust continuity has fallen below the normal operating band.</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="micro-label">Linked timeline</div>
            {state.timeline.slice(-4).reverse().map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelectEvent(entry.id)}
                className="w-full rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5"
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
        </Card>
      </div>
    </div>
  );
}
