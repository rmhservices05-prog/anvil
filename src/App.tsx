import {
  Activity,
  Clock3,
  Gauge,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Card, Drawer } from './components/ui';
import { cn } from './lib/utils';
import { formatPercent, formatSeconds } from './lib/seed';
import { LiveExerciseScreen } from './features/live-exercise/LiveExerciseScreen';
import { AttackForgeScreen } from './features/attack-forge/AttackForgeScreen';
import { ProtocolAnalysisScreen } from './features/protocol-analysis/ProtocolAnalysisScreen';
import type { ScreenId, SelectedDetail, SimulationState } from './types';

export default function App() {
  const { state, dispatch } = useAnvilSimulation();
  const pendingExportDownload = useRef(false);
  const sidebarCollapsed = state.layout.sidebarCollapsed;

  const activeStep = state.workflow.find((step) => step.status === 'active') ?? state.workflow[0];
  const selectedDetail = state.selectedDetail ?? state.layout.selectedDetail;
  const selectedArtifact = useMemo(() => getFocusedArtifact(state, selectedDetail), [state, selectedDetail]);
  const screenIcon = (screen: ScreenId, status?: 'active' | 'complete' | 'queued') => {
    const iconClass = status === 'active' ? 'text-[#f3f3f3]' : status === 'complete' ? 'text-[#4f8cff]' : 'text-[#6e86bb]';
    switch (screen) {
      case 'live':
        return <Play size={13} strokeWidth={2.3} className={iconClass} />;
      case 'attack':
        return <ShieldAlert size={13} strokeWidth={2.3} className={iconClass} />;
      case 'analysis':
        return <Gauge size={13} strokeWidth={2.3} className={iconClass} />;
      default:
        return <Workflow size={13} strokeWidth={2.3} className={iconClass} />;
    }
  };
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

  const closeDetail = () => {
    dispatch({
      type: 'set-panel-layout',
      layout: { selectedDetail: undefined },
    });
  };

  const screenContent = renderScreenContent(state, dispatch);

  return (
    <div className="app-shell min-h-screen bg-[#070707] text-[#d6d6d6]">
      <div
        className={cn(
          'grid min-h-screen grid-cols-1',
          sidebarCollapsed ? 'lg:grid-cols-[76px_minmax(0,1fr)]' : 'lg:grid-cols-[240px_minmax(0,1fr)]',
        )}
      >
        <aside
          className={cn(
            'flex w-full flex-col border-b border-white/[0.07] bg-[#090909] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r',
          )}
        >
          <div className={cn('border-b border-white/[0.06] py-4', sidebarCollapsed ? 'px-3' : 'px-4')}>
            <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'justify-center')}>
              <button
                type="button"
                onClick={() => dispatch({ type: 'toggle-sidebar' })}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={cn(
                  'relative m-0 flex h-8 items-center justify-center overflow-hidden border-0 bg-transparent p-0 shadow-none outline-none ring-0 appearance-none',
                  'transition-[width,transform,opacity] duration-300 ease-out',
                  'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                  sidebarCollapsed ? 'w-8' : 'w-full',
                )}
              >
                <img
                  src="/small-anvil-logo.png"
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 m-auto block h-7 w-7 object-contain transition-all duration-300 ease-out',
                    sidebarCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                  )}
                />
                <img
                  src="/long-logo.png"
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 m-auto block h-7 w-auto max-w-[180px] object-contain transition-all duration-300 ease-out',
                    sidebarCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
                  )}
                />
              </button>
            </div>
          </div>

          <div className={cn('thin-scrollbar flex-1 min-h-0 overflow-y-auto py-4', sidebarCollapsed ? 'px-2' : 'px-4')}>
            {sidebarCollapsed ? (
              <div className="flex h-full flex-col items-center">
              <div className="flex w-full flex-col gap-2">
                  {state.workflow.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => dispatch({ type: 'set-screen', screen: step.id })}
                      aria-label={step.label}
                      title={step.label}
                      className={cn(
                        'flex h-11 w-full items-center justify-center border-0 bg-transparent text-[#6e86bb] transition',
                        step.status === 'active'
                          ? 'text-[#f3f3f3]'
                          : step.status === 'complete'
                            ? 'hover:bg-white/[0.04] hover:text-[#d6d6d6]'
                            : 'hover:bg-white/[0.04] hover:text-[#8c8c8c]',
                      )}
                    >
                      {screenIcon(step.id, step.status)}
                      <span className="sr-only">{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <section className="space-y-2">
                  <div className="space-y-1">
                    {state.workflow.map((step) => (
                      <button
                        key={step.id}
                        onClick={() => dispatch({ type: 'set-screen', screen: step.id })}
                        className={cn(
                          'flex w-full items-center gap-3 border px-3 py-2 text-left transition',
                          step.status === 'active'
                            ? 'border-amber-500/30 bg-amber-500/10 text-[#f3f3f3]'
                            : step.status === 'complete'
                              ? 'border-white/[0.08] bg-[#131313] text-[#d6d6d6] hover:bg-[#161616]'
                              : 'border-white/[0.06] bg-[#101010] text-[#8c8c8c] hover:bg-[#151515]',
                        )}
                      >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247]">
                          {screenIcon(step.id)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium">{step.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 bg-[#101010]">
          <header className="border-b border-white/[0.07] bg-[#111111]/95">
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

              <div className="grid gap-2 md:grid-cols-4">
                <MetricPill label="Phase" value={state.session.phase} tone={phaseTone(state.session.phase)} icon={<Clock3 size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                <MetricPill label="Connection" value={state.connectionState} tone={connectionTone(state.connectionState)} icon={<Activity size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                <MetricPill label="Threat" value={`${Math.round(state.threatPressure)}`} tone={state.threatPressure > 60 ? 'hostile' : state.threatPressure > 32 ? 'amber' : 'trust'} icon={<ShieldAlert size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
                <MetricPill label="Confidence" value={formatPercent(state.confidence)} tone={state.confidence > 74 ? 'trust' : state.confidence > 48 ? 'amber' : 'hostile'} icon={<Gauge size={11} strokeWidth={2.2} className="text-[#4f8cff]" />} />
              </div>
            </div>
          </header>

          <div className="space-y-5 p-4 lg:p-5">{screenContent}</div>
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

function renderScreenContent(state: SimulationState, dispatch: ReturnType<typeof useAnvilSimulation>['dispatch']) {
  switch (state.screen) {
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
    default:
      return (
        <AttackForgeScreen
          state={state}
          onToggleAttack={(attack) => dispatch({ type: 'toggle-attack', attack })}
          onChangeAttackParam={(key, value) => dispatch({ type: 'set-attack-param', key, value })}
          onSelectEvent={(id) => dispatch({ type: 'select-event', id })}
          onInject={() => dispatch({ type: 'inject-attack' })}
        />
      );
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
