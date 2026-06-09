import {
  Clock3,
  Lock,
  Menu,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Card } from './components/ui';
import { cn } from './lib/utils';
import { formatPercent, formatSeconds } from './lib/seed';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { LiveExerciseScreen } from './features/live-exercise/LiveExerciseScreen';
import { AttackForgeScreen } from './features/attack-forge/AttackForgeScreen';
import { LineageScreen } from './features/lineage/LineageScreen';
import { GuardrailsScreen } from './features/guardrails/GuardrailsScreen';
import { ProtocolAnalysisScreen } from './features/protocol-analysis/ProtocolAnalysisScreen';
import { EvidencePackScreen } from './features/evidence-pack/EvidencePackScreen';
import type { SimulationState } from './types';

export default function App() {
  const { state, dispatch } = useAnvilSimulation();

  const screenContent = renderScreenContent(state, dispatch);
  const focusedArtifact = getFocusedArtifact(state);
  const activeStep = state.workflow.find((step) => step.status === 'active') ?? state.workflow[0];

  return (
    <div className="app-shell min-h-screen bg-[#070707] text-[#d6d6d6]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-white/[0.07] bg-[#090909] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center border border-white/[0.12] bg-[#101010]">
                <div className="h-3 w-3 border border-white/70" />
              </div>
              <div>
                <div className="text-[13px] font-semibold tracking-normal text-[#f3f3f3]">ANVIL</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#626262]">Ground / Air console</div>
              </div>
            </div>
            <Menu size={16} className="text-[#7a7a7a]" />
          </div>

          <div className="thin-scrollbar flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-5">
            <Card className="space-y-4 bg-[#101010]">
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <div className="micro-label">Mission frame</div>
                  <div className="mt-1 text-[13px] font-medium text-[#f3f3f3]">{state.scenario.title}</div>
                  <div className="mt-1 text-[11px] leading-5 text-[#8c8c8c]">{state.scenario.subtitle}</div>
                </div>
                <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : state.mode === 'Contested' ? 'warn' : 'success'}>
                  {state.mode}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricPill label="Threat" value={`${Math.round(state.threatPressure)}`} tone={state.threatPressure > 60 ? 'hostile' : state.threatPressure > 32 ? 'amber' : 'trust'} />
                <MetricPill label="Confidence" value={formatPercent(state.confidence)} tone={state.confidence > 74 ? 'trust' : state.confidence > 48 ? 'amber' : 'hostile'} />
                <MetricPill label="Elapsed" value={formatSeconds(state.timeElapsed)} tone="trust" />
                <MetricPill label="Alerts" value={`${state.alerts.length}`} tone={state.alerts.some((item) => item.severity === 'critical') ? 'hostile' : 'amber'} />
              </div>
            </Card>

            <section className="space-y-2">
              <div className="micro-label">Mission flow</div>
              <div className="space-y-1">
                {state.workflow.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => dispatch({ type: 'set-screen', screen: step.id })}
                    className={cn(
                      'w-full border px-3 py-3 text-left transition',
                      step.status === 'active'
                        ? 'border-amber-500/30 bg-amber-500/10 text-[#f3f3f3]'
                        : step.status === 'complete'
                          ? 'border-white/[0.08] bg-[#131313] text-[#d6d6d6] hover:bg-[#161616]'
                          : 'border-white/[0.06] bg-[#101010] text-[#8c8c8c] hover:bg-[#151515]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-medium">
                          <span className="mr-2 text-[10px] uppercase tracking-[0.16em] text-[#6f6f6f]">
                            0{index + 1}
                          </span>
                          {step.label}
                        </div>
                        <div className="mt-1 text-[11px] leading-4 text-[#8c8c8c]">{step.detail}</div>
                      </div>
                      <Badge
                        tone={
                          step.status === 'active'
                            ? 'amber'
                            : step.status === 'complete'
                              ? 'success'
                              : 'muted'
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <div className="micro-label">Mission alerts</div>
              <div className="space-y-2">
                {state.alerts.map((alert) => (
                  <Card key={alert.id} className="space-y-2 bg-[#111111] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'warn' ? 'warn' : 'success'}>{alert.severity}</Badge>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#626262]">{alert.driver}</span>
                    </div>
                    <div className="text-[12px] font-medium text-[#f3f3f3]">{alert.title}</div>
                    <div className="text-[11px] leading-5 text-[#8c8c8c]">{alert.detail}</div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <div className="micro-label">Controls</div>
              <div className="grid gap-2">
                <Button
                  variant="default"
                  onClick={() => dispatch({ type: state.isRunning ? 'pause' : 'run' })}
                  className="w-full justify-start"
                >
                  {state.isRunning ? <Pause size={15} /> : <Play size={15} />}
                  {state.isRunning ? 'Pause' : 'Run'}
                </Button>
                <Button variant="outline" onClick={() => dispatch({ type: 'reset' })} className="w-full justify-start">
                  <RotateCcw size={15} />
                  Reset
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    dispatch({ type: 'set-screen', screen: 'live' });
                    dispatch({ type: 'inject-attack' });
                    dispatch({ type: 'run' });
                  }}
                  className="w-full justify-start"
                >
                  <ShieldAlert size={15} />
                  Inject Attack
                </Button>
              </div>
            </section>

            <section className="space-y-2">
              <div className="micro-label">Current focus</div>
              <Card className="space-y-2 bg-[#101010] p-3">
                {focusedArtifact ? (
                  <>
                    <div className="text-[12px] font-medium text-[#f3f3f3]">{focusedArtifact.title}</div>
                    <div className="text-[11px] leading-5 text-[#8c8c8c]">{focusedArtifact.detail}</div>
                  </>
                ) : (
                  <div className="text-[11px] leading-5 text-[#8c8c8c]">
                    No focus selected. Click a node, event, or branch to inspect it here.
                  </div>
                )}
              </Card>
            </section>
          </div>

          <div className="border-t border-white/[0.07] px-4 py-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#626262]">
              <span>Runtime</span>
              <span>{state.metrics.lastVerifiedEpoch}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#8c8c8c]">
              <Lock size={12} />
              {state.metrics.guardrailLock} guardrails, deterministic local simulation
            </div>
          </div>
          </div>
        </aside>

        <main className="min-w-0 bg-[#101010]">
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#111111]/95 backdrop-blur">
            <div className="space-y-4 px-4 py-4 lg:px-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="micro-label">Active screen</div>
                  <div className="mt-1 text-[15px] font-semibold tracking-tight text-[#f3f3f3]">
                    {activeStep?.label ?? 'ANVIL'}
                  </div>
                  <div className="mt-1 max-w-3xl text-[12px] leading-5 text-[#8c8c8c]">
                    {activeStep?.detail ?? 'Mission console shell'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={state.confidence > 74 ? 'success' : state.confidence > 48 ? 'warn' : 'danger'}>
                    Confidence {Math.round(state.confidence)}%
                  </Badge>
                  <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : state.mode === 'Contested' ? 'warn' : 'success'}>
                    {state.mode}
                  </Badge>
                  <Badge tone="muted" className="inline-flex items-center gap-2">
                    <Clock3 size={12} />
                    {formatSeconds(state.timeElapsed)}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {state.workflow.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => dispatch({ type: 'set-screen', screen: step.id })}
                    className={cn(
                      'border px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition',
                      step.status === 'active'
                        ? 'border-amber-500/30 bg-amber-500/10 text-[#f3f3f3]'
                        : step.status === 'complete'
                          ? 'border-white/[0.07] bg-[#151515] text-[#d6d6d6] hover:bg-[#191919]'
                          : 'border-white/[0.05] bg-[#101010] text-[#8c8c8c] hover:bg-[#151515]',
                    )}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="space-y-5 p-4 lg:p-5">
            <section className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
              <Card className="space-y-4 bg-[#111111]">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="micro-label">What changed</div>
                    <div className="text-[13px] font-medium text-[#f3f3f3]">Derived from the current phase, attack mix, and trust posture</div>
                  </div>
                  <Badge tone={state.alerts.some((alert) => alert.severity === 'critical') ? 'danger' : 'amber'}>
                    {state.alerts.some((alert) => alert.severity === 'critical') ? 'Critical watch' : 'Monitoring'}
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {state.briefing.map((item) => (
                    <div key={item.label} className="border border-white/[0.07] bg-[#151515] p-3">
                      <div className="micro-label">{item.label}</div>
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <div className="font-mono text-[20px] leading-none text-[#f3f3f3]">{item.value}</div>
                        <Badge tone={item.tone === 'trust' ? 'success' : item.tone === 'amber' ? 'warn' : 'danger'}>{item.tone}</Badge>
                      </div>
                      <div className="mt-2 text-[11px] leading-5 text-[#8c8c8c]">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="space-y-4 bg-[#111111]">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="micro-label">Focus</div>
                    <div className="text-[13px] font-medium text-[#f3f3f3]">Operator selection and runtime state</div>
                  </div>
                  <Badge tone={state.selectedDetail ? 'success' : 'muted'}>{state.selectedDetail ? 'selected' : 'idle'}</Badge>
                </div>
                <div className="space-y-3">
                  <FocusRow label="Scenario" value={state.scenario.title} />
                  <FocusRow label="Environment" value={state.environment.replace('-', ' / ')} />
                  <FocusRow label="Current epoch" value={state.metrics.lastVerifiedEpoch} />
                  <FocusRow label="Workflow stage" value={activeStep?.label ?? 'Unknown'} />
                </div>
              </Card>
            </section>

            {screenContent}
          </div>
        </main>
      </div>
    </div>
  );
}

function renderScreenContent(
  state: SimulationState,
  dispatch: ReturnType<typeof useAnvilSimulation>['dispatch'],
) {
  switch (state.screen) {
    case 'overview':
      return <OverviewScreen state={state} onSelectEvent={(id) => dispatch({ type: 'select-detail', detail: { type: 'event', id } })} />;
    case 'live':
      return (
        <LiveExerciseScreen
          state={state}
          onToggleAttack={(attack) => dispatch({ type: 'toggle-attack', attack })}
          onChangeAttackParam={(key, value) => dispatch({ type: 'set-attack-param', key, value })}
          onChangePhase={(phase) => dispatch({ type: 'set-phase', phase })}
          onSelectNode={(node) => dispatch({ type: 'select-detail', detail: { type: 'node', id: node.id } })}
          onLaunch={() => {
            dispatch({ type: 'run' });
            dispatch({ type: 'inject-attack' });
          }}
        />
      );
    case 'attack':
      return <AttackForgeScreen state={state} />;
    case 'lineage':
      return (
        <LineageScreen
          state={state}
          onSelect={(branch) => dispatch({ type: 'select-detail', detail: { type: 'branch', id: branch.id } })}
        />
      );
    case 'guardrails':
      return <GuardrailsScreen state={state} />;
    case 'analysis':
      return <ProtocolAnalysisScreen state={state} />;
    case 'evidence':
      return <EvidencePackScreen state={state} onExport={() => dispatch({ type: 'export' })} />;
    default:
      return <OverviewScreen state={state} onSelectEvent={(id) => dispatch({ type: 'select-detail', detail: { type: 'event', id } })} />;
  }
}

function getFocusedArtifact(state: SimulationState) {
  const detail = state.selectedDetail;
  if (!detail) {
    return null;
  }

  if (detail.type === 'node') {
    const node = state.nodes.find((item) => item.id === detail.id);
    if (!node) return { title: 'Selected node', detail: 'Node not found in the current scenario snapshot.' };
    return {
      title: node.label,
      detail: `${node.role} node at ${node.trust}% trust with ${node.lineageState.replace('-', ' ')} lineage.`,
    };
  }

  if (detail.type === 'event') {
    const event = state.attackEvents.find((item) => item.id === detail.id);
    if (!event) return { title: 'Selected event', detail: 'Event not found in the current timeline snapshot.' };
    return {
      title: `${event.time} · ${event.source}`,
      detail: `${event.message} Impact ${event.trustImpact > 0 ? '+' : ''}${event.trustImpact}.`,
    };
  }

  const branch = state.lineageBranches.find((item) => item.id === detail.id);
  if (!branch) return { title: 'Selected branch', detail: 'Branch not found in the current lineage snapshot.' };
  return {
    title: branch.epoch,
    detail: `${branch.status} branch with ${branch.trust}% trust and successor state "${branch.successorState}".`,
  };
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'trust' | 'amber' | 'hostile';
}) {
  return (
    <div className="border border-white/[0.07] bg-[#151515] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c]">{label}</div>
      <div
        className={cn(
          'mt-2 font-mono text-[16px] leading-none',
          tone === 'trust' ? 'text-[#72c8a0]' : tone === 'amber' ? 'text-[#e0b466]' : 'text-[#e28a86]',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FocusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-white/[0.06] bg-[#151515] px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8c8c8c]">{label}</span>
      <span className="max-w-[70%] text-right text-[12px] leading-5 text-[#f3f3f3]">{value}</span>
    </div>
  );
}
