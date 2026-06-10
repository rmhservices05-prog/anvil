import {
  Activity,
  Clock3,
  Download,
  Eye,
  Gauge,
  Lock,
  Menu,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Shield,
  ShieldAlert,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Card, Drawer } from './components/ui';
import { cn } from './lib/utils';
import { formatPercent, formatSeconds } from './lib/seed';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { LiveExerciseScreen } from './features/live-exercise/LiveExerciseScreen';
import { AttackForgeScreen } from './features/attack-forge/AttackForgeScreen';
import { LineageScreen } from './features/lineage/LineageScreen';
import { GuardrailsScreen } from './features/guardrails/GuardrailsScreen';
import { ProtocolAnalysisScreen } from './features/protocol-analysis/ProtocolAnalysisScreen';
import { EvidencePackScreen } from './features/evidence-pack/EvidencePackScreen';
import type { SelectedDetail, SimulationState } from './types';

export default function App() {
  const { state, dispatch } = useAnvilSimulation();
  const pendingExportDownload = useRef(false);
  const sidebarCollapsed = state.layout.sidebarCollapsed;

  const activeStep = state.workflow.find((step) => step.status === 'active') ?? state.workflow[0];
  const selectedDetail = state.selectedDetail ?? state.layout.selectedDetail;
  const selectedArtifact = useMemo(() => getFocusedArtifact(state, selectedDetail), [state, selectedDetail]);

  useEffect(() => {
    if (!pendingExportDownload.current || state.exportStatus !== 'success' || !state.exportPayload) return;
    pendingExportDownload.current = false;
    const blob = new Blob([JSON.stringify(state.exportPayload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${state.session.id}-evidence.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }, [state.exportPayload, state.exportStatus, state.session.id]);

  const requestExport = () => {
    pendingExportDownload.current = true;
    dispatch({ type: 'export-evidence' });
  };

  const closeDetail = () => {
    dispatch({
      type: 'set-panel-layout',
      layout: { selectedDetail: undefined },
    });
  };

  const screenContent = renderScreenContent(state, dispatch, requestExport);

  return (
    <div className="app-shell min-h-screen bg-[#070707] text-[#d6d6d6]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside
          className={cn(
            'flex flex-col border-b border-white/[0.07] bg-[#090909] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r',
            sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[300px]',
          )}
        >
          <div className={cn('border-b border-white/[0.06] py-4', sidebarCollapsed ? 'px-3' : 'px-4')}>
            <div className={cn('flex items-center gap-3', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
              <div className={cn('flex items-center gap-3', sidebarCollapsed ? 'flex-col gap-2' : '')}>
                <div className="grid h-8 w-8 place-items-center border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <Radar size={14} strokeWidth={2.2} className="text-[#4f8cff]" />
                </div>
                {!sidebarCollapsed ? (
                  <div>
                    <div className="text-[13px] font-semibold tracking-normal text-[#f3f3f3]">ANVIL</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#626262]">Ground / Air console</div>
                  </div>
                ) : null}
              </div>
              <Button variant="ghost" onClick={() => dispatch({ type: 'toggle-sidebar' })} aria-label="Toggle sidebar">
                <Menu size={16} className="text-[#4f8cff]" />
              </Button>
            </div>
          </div>

          <div className={cn('thin-scrollbar flex-1 min-h-0 overflow-y-auto py-4', sidebarCollapsed ? 'px-2' : 'px-4')}>
            {sidebarCollapsed ? (
              <div className="flex h-full flex-col items-center">
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                    <Radar size={14} strokeWidth={2.2} className="text-[#4f8cff]" />
                  </div>
                  <Button variant="ghost" onClick={() => dispatch({ type: 'toggle-sidebar' })} aria-label="Expand sidebar">
                    <Menu size={16} className="text-[#4f8cff]" />
                  </Button>
                  <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : state.mode === 'Contested' ? 'warn' : 'success'}>
                    {state.mode.slice(0, 3)}
                  </Badge>
                  <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount}</Badge>
                </div>

                <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-white/[0.07] pt-3">
                  <Button variant="ghost" onClick={() => dispatch({ type: 'start-session' })} aria-label="Start session">
                    <Play size={15} className="text-[#4f8cff]" />
                  </Button>
                  <Button variant="outline" onClick={() => dispatch({ type: 'connect' })} aria-label="Connect">
                    <ShieldAlert size={15} className="text-[#4f8cff]" />
                  </Button>
                  <Button variant="ghost" onClick={() => dispatch({ type: 'pause' })} aria-label="Pause">
                    <Pause size={15} className="text-[#4f8cff]" />
                  </Button>
                  <Button variant="outline" onClick={requestExport} aria-label="Export">
                    <Download size={15} className="text-[#4f8cff]" />
                  </Button>
                  <Button variant="danger" onClick={() => dispatch({ type: 'reset' })} aria-label="Reset">
                    <RotateCcw size={15} className="text-[#4f8cff]" />
                  </Button>
                  <div className="pt-2 text-[10px] uppercase tracking-[0.16em] text-[#626262]">{formatSeconds(state.timeElapsed)}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                      <Workflow size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                    </span>
                    <div className="micro-label">Mission flow</div>
                  </div>
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
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium">
                              <span className="mr-2 text-[10px] uppercase tracking-[0.16em] text-[#6f6f6f]">0{index + 1}</span>
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                      <ShieldAlert size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                    </span>
                    <div className="micro-label">Mission alerts</div>
                  </div>
                  <div className="space-y-2">
                    {state.consoleAlerts.map((alert) => (
                      <Card key={alert.id} className="space-y-2 bg-[#111111] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge tone={alert.level === 'critical' ? 'danger' : alert.level === 'warn' ? 'warn' : 'success'}>{alert.level}</Badge>
                          <Button
                            variant="ghost"
                            onClick={() => dispatch({ type: 'acknowledge-alert', id: alert.id })}
                            disabled={alert.acknowledged}
                          >
                            {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                          </Button>
                        </div>
                        <div className="text-[12px] font-medium text-[#f3f3f3]">{alert.title}</div>
                        <div className="text-[11px] leading-5 text-[#8c8c8c]">{alert.message}</div>
                      </Card>
                    ))}
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                      <Activity size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                    </span>
                    <div className="micro-label">Session lifecycle</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="default" onClick={() => dispatch({ type: 'start-session' })} className="justify-start">
                      <Play size={15} className="text-[#4f8cff]" />
                      Start
                    </Button>
                    <Button variant="outline" onClick={() => dispatch({ type: 'connect' })} className="justify-start">
                      <ShieldAlert size={15} className="text-[#4f8cff]" />
                      Connect
                    </Button>
                    <Button variant="ghost" onClick={() => dispatch({ type: 'pause' })} className="justify-start">
                      <Pause size={15} className="text-[#4f8cff]" />
                      Pause
                    </Button>
                    <Button variant="ghost" onClick={() => dispatch({ type: 'resume' })} className="justify-start">
                      <Play size={15} className="text-[#4f8cff]" />
                      Resume
                    </Button>
                    <Button variant="outline" onClick={() => dispatch({ type: 'step' })} className="justify-start">
                      <Clock3 size={15} className="text-[#4f8cff]" />
                      Step
                    </Button>
                    <Button variant="outline" onClick={() => dispatch({ type: 'set-review-mode', reviewMode: !state.reviewMode })} className="justify-start">
                      <Eye size={15} className="text-[#4f8cff]" />
                      Review
                    </Button>
                    <Button variant="amber" onClick={requestExport} className="justify-start">
                      <Download size={15} className="text-[#4f8cff]" />
                      Export
                    </Button>
                    <Button variant="danger" onClick={() => dispatch({ type: 'reset' })} className="justify-start">
                      <RotateCcw size={15} className="text-[#4f8cff]" />
                      Reset
                    </Button>
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                      <Eye size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                    </span>
                    <div className="micro-label">Current focus</div>
                  </div>
                  <Card className="space-y-2 bg-[#101010] p-3">
                    {selectedArtifact ? (
                      <>
                        <div className="text-[12px] font-medium text-[#f3f3f3]">{selectedArtifact.title}</div>
                        <div className="text-[11px] leading-5 text-[#8c8c8c]">{selectedArtifact.detail}</div>
                      </>
                    ) : (
                      <div className="text-[11px] leading-5 text-[#8c8c8c]">
                        No focus selected. Click a node, event, branch, or evidence row to inspect it here.
                      </div>
                    )}
                  </Card>
                </section>
              </div>
            )}
          </div>

          <div className={cn('border-t border-white/[0.07] py-3', sidebarCollapsed ? 'px-3' : 'px-4')}>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#626262]">
              <span>{sidebarCollapsed ? 'Run' : 'Runtime'}</span>
              <span>{sidebarCollapsed ? state.metrics.lastVerifiedEpoch.slice(0, 2) : state.metrics.lastVerifiedEpoch}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#8c8c8c]">
              <Lock size={12} className="text-[#4f8cff]" />
              {sidebarCollapsed ? state.metrics.guardrailLock : `${state.metrics.guardrailLock} guardrails, deterministic local simulation`}
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={phaseBadgeTone(state.session.phase)}>{state.session.phase}</Badge>
                    <Badge tone={connectionBadgeTone(state.connectionState)}>{state.connectionState}</Badge>
                    <Badge tone="muted">{state.scenario.title}</Badge>
                    <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
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
                    <Clock3 size={12} className="text-[#4f8cff]" />
                    {formatSeconds(state.timeElapsed)}
                  </Badge>
                </div>
              </div>

              <Card className="space-y-4 bg-[#111111]">
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                        <Shield size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                      </span>
                      <div className="micro-label">Mission frame</div>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-[#f3f3f3]">{state.scenario.title}</div>
                    <div className="mt-1 max-w-3xl text-[11px] leading-5 text-[#8c8c8c]">{state.scenario.subtitle}</div>
                  </div>
                  <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : state.mode === 'Contested' ? 'warn' : 'success'}>
                    {state.mode}
                  </Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-4">
                  <MetricPill label="Phase" value={state.session.phase} tone={phaseTone(state.session.phase)} icon={<Clock3 size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                  <MetricPill label="Connection" value={state.connectionState} tone={connectionTone(state.connectionState)} icon={<Activity size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                  <MetricPill label="Threat" value={`${Math.round(state.threatPressure)}`} tone={state.threatPressure > 60 ? 'hostile' : state.threatPressure > 32 ? 'amber' : 'trust'} icon={<ShieldAlert size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                  <MetricPill label="Confidence" value={formatPercent(state.confidence)} tone={state.confidence > 74 ? 'trust' : state.confidence > 48 ? 'amber' : 'hostile'} icon={<Gauge size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                </div>
              </Card>

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
                    <div className="text-[13px] font-medium text-[#f3f3f3]">
                      Derived from the current phase, attack mix, and trust posture
                    </div>
                  </div>
                  <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'amber'}>
                    {state.summary.alertCount > 0 ? 'Operator attention' : 'Monitoring'}
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
                  <Badge tone={selectedDetail ? 'success' : 'muted'}>{selectedDetail ? 'selected' : 'idle'}</Badge>
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

      <Drawer open={Boolean(selectedArtifact)} title={selectedArtifact?.title ?? 'Operator detail'} onClose={closeDetail}>
        {selectedArtifact ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-4">
              <div className="micro-label">Summary</div>
              <div className="mt-2 text-sm leading-6 text-[#f3f3f3]">{selectedArtifact.detail}</div>
            </div>
            {renderDetailPanel(state, selectedDetail)}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

function renderScreenContent(
  state: SimulationState,
  dispatch: ReturnType<typeof useAnvilSimulation>['dispatch'],
  onExport: () => void,
) {
  switch (state.screen) {
    case 'overview':
      return (
        <OverviewScreen
          state={state}
          onSelectEvent={(id) => dispatch({ type: 'select-event', id })}
          onSelectEvidence={(id) => dispatch({ type: 'select-evidence', id })}
        />
      );
    case 'live':
      return (
        <LiveExerciseScreen
          state={state}
          onStart={() => dispatch({ type: 'start-session' })}
          onConnect={() => dispatch({ type: 'connect' })}
          onPause={() => dispatch({ type: 'pause' })}
          onResume={() => dispatch({ type: 'resume' })}
          onStep={() => dispatch({ type: 'step' })}
          onToggleAttack={(attack) => dispatch({ type: 'toggle-attack', attack })}
          onChangeAttackParam={(key, value) => dispatch({ type: 'set-attack-param', key, value })}
          onChangePhase={(phase) => dispatch({ type: 'set-phase', phase })}
          onSelectNode={(node) => dispatch({ type: 'select-node', id: node.id })}
          onSelectEvent={(id) => dispatch({ type: 'select-event', id })}
          onInjectAttack={() => dispatch({ type: 'inject-attack' })}
        />
      );
    case 'attack':
      return (
        <AttackForgeScreen
          state={state}
          onToggleAttack={(attack) => dispatch({ type: 'toggle-attack', attack })}
          onChangeAttackParam={(key, value) => dispatch({ type: 'set-attack-param', key, value })}
          onInject={() => dispatch({ type: 'inject-attack' })}
          onSelectEvent={(id) => dispatch({ type: 'select-event', id })}
        />
      );
    case 'lineage':
      return (
        <LineageScreen
          state={state}
          onSelect={(branch) => dispatch({ type: 'select-branch', id: branch.id })}
          onFilter={(status) => dispatch({ type: 'set-panel-layout', layout: { filters: { ...state.layout.filters, lineage: status } } })}
        />
      );
    case 'guardrails':
      return (
        <GuardrailsScreen
          state={state}
          onAcknowledge={(id) => dispatch({ type: 'acknowledge-alert', id })}
          onSelectEvent={(id) => dispatch({ type: 'select-event', id })}
        />
      );
    case 'analysis':
      return (
        <ProtocolAnalysisScreen
          state={state}
          onFilter={(protocol) =>
            dispatch(protocol ? { type: 'filter-protocol', protocol } : { type: 'filter-protocol' })
          }
          onToggleComparison={() =>
            dispatch({
              type: 'set-panel-layout',
              layout: { filters: { ...state.layout.filters, comparisonMode: !state.layout.filters.comparisonMode } },
            })
          }
        />
      );
    case 'evidence':
      return (
        <EvidencePackScreen
          state={state}
          onExport={onExport}
          onSelectEvidence={(id) => dispatch({ type: 'select-evidence', id })}
        />
      );
    default:
      return <OverviewScreen state={state} onSelectEvent={(id) => dispatch({ type: 'select-event', id })} onSelectEvidence={(id) => dispatch({ type: 'select-evidence', id })} />;
  }
}

function getFocusedArtifact(state: SimulationState, detail: SelectedDetail | undefined) {
  if (!detail) return null;

  if (detail.type === 'node') {
    const node = state.nodes.find((item) => item.id === detail.id);
    if (!node) return { title: 'Selected node', detail: 'Node not found in the current scenario snapshot.' };
    return {
      title: node.label,
      detail: `${node.role} node at ${node.trust}% trust with ${node.lineageState.replace('-', ' ')} lineage.`,
    };
  }

  if (detail.type === 'event') {
    const event = state.timeline.find((item) => item.id === detail.id) ?? state.attackEvents.find((item) => item.id === detail.id);
    if (!event) return { title: 'Selected event', detail: 'Event not found in the current timeline snapshot.' };
    return {
      title: 'timestamp' in event ? event.title : `${event.time} · event`,
      detail: 'details' in event ? `${event.details} (${event.severity})` : `${event.message} (${event.severity})`,
    };
  }

  if (detail.type === 'evidence') {
    const evidence = state.evidence.find((item) => item.id === detail.id);
    if (!evidence) return { title: 'Selected evidence', detail: 'Evidence not found in the current session artifact.' };
    return {
      title: evidence.title,
      detail: `${evidence.category} · ${evidence.source} · ${evidence.summary}`,
    };
  }

  const branch = state.lineageBranches.find((item) => item.id === detail.id);
  if (!branch) return { title: 'Selected branch', detail: 'Branch not found in the current lineage snapshot.' };
  return {
    title: branch.epoch,
    detail: `${branch.status} branch with ${branch.trust}% trust and successor state "${branch.successorState}".`,
  };
}

function renderDetailPanel(state: SimulationState, detail: SelectedDetail | undefined) {
  if (!detail) return null;

  if (detail.type === 'node') {
    const node = state.nodes.find((item) => item.id === detail.id);
    if (!node) return <DetailRows rows={[['State', 'Unavailable']]} />;
    return (
      <DetailRows
        rows={[
          ['Type', 'Node'],
          ['Role', node.role],
          ['Trust', `${node.trust}%`],
          ['Lineage', node.lineageState],
        ]}
      />
    );
  }

  if (detail.type === 'event') {
    const event = state.timeline.find((item) => item.id === detail.id);
    if (!event) return <DetailRows rows={[['State', 'Unavailable']]} />;
    return (
      <DetailRows
        rows={[
          ['Type', event.type],
          ['Timestamp', event.timestamp],
          ['Severity', event.severity],
          ['Details', event.details],
        ]}
      />
    );
  }

  if (detail.type === 'evidence') {
    const evidence = state.evidence.find((item) => item.id === detail.id);
    if (!evidence) return <DetailRows rows={[['State', 'Unavailable']]} />;
    return (
      <DetailRows
        rows={[
          ['Category', evidence.category],
          ['Severity', evidence.severity],
          ['Source', evidence.source],
          ['Timestamp', evidence.timestamp],
          ['Details', evidence.details],
        ]}
      />
    );
  }

  const branch = state.lineageBranches.find((item) => item.id === detail.id);
  if (!branch) return <DetailRows rows={[['State', 'Unavailable']]} />;
  return (
    <DetailRows
      rows={[
        ['Epoch', branch.epoch],
        ['Status', branch.status],
        ['Trust', `${branch.trust}%`],
        ['Successor', branch.successorState],
        ['Reason', branch.acceptanceReason],
      ]}
    />
  );
}

function DetailRows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 border border-white/[0.06] bg-[#151515] px-3 py-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#8c8c8c]">{label}</span>
          <span className="max-w-[70%] text-right text-[12px] leading-5 text-[#f3f3f3]">{value}</span>
        </div>
      ))}
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone,
  compact = false,
  icon,
}: {
  label: string;
  value: string;
  tone: 'trust' | 'amber' | 'hostile';
  compact?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="border border-white/[0.07] bg-[#151515] px-3 py-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c]">
        {icon ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">{icon}</span> : null}
        {label}
      </div>
      {!compact ? (
        <div
          className={cn(
            'mt-2 font-mono text-[16px] leading-none',
            tone === 'trust' ? 'text-[#72c8a0]' : tone === 'amber' ? 'text-[#e0b466]' : 'text-[#e28a86]',
          )}
        >
          {value}
        </div>
      ) : (
        <div className="mt-2 text-[12px] font-medium text-[#f3f3f3]">{value}</div>
      )}
    </div>
  );
}

function phaseTone(phase: string): 'trust' | 'amber' | 'hostile' {
  return phase === 'running' || phase === 'review' ? 'trust' : phase === 'preparing' || phase === 'connecting' || phase === 'recovering' ? 'amber' : 'hostile';
}

function connectionTone(connection: string): 'trust' | 'amber' | 'hostile' {
  return connection === 'connected' ? 'trust' : connection === 'connecting' || connection === 'degraded' ? 'amber' : 'hostile';
}

function phaseBadgeTone(phase: string): 'warn' | 'amber' | 'success' | 'danger' | 'muted' {
  return phase === 'running' || phase === 'review' ? 'success' : phase === 'preparing' || phase === 'connecting' || phase === 'recovering' ? 'amber' : 'danger';
}

function connectionBadgeTone(connection: string): 'warn' | 'amber' | 'success' | 'danger' | 'muted' {
  return connection === 'connected' ? 'success' : connection === 'connecting' || connection === 'degraded' ? 'warn' : 'danger';
}

function FocusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-white/[0.06] bg-[#151515] px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-[#8c8c8c]">{label}</span>
      <span className="max-w-[70%] text-right text-[12px] leading-5 text-[#f3f3f3]">{value}</span>
    </div>
  );
}
