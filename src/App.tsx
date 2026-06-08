import { useMemo, useState } from 'react';
import { useAnvilSimulation } from './hooks/useAnvilSimulation';
import { Badge, Button, Drawer } from './components/ui';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { LiveExerciseScreen } from './features/live-exercise/LiveExerciseScreen';
import { AttackForgeScreen } from './features/attack-forge/AttackForgeScreen';
import { LineageScreen } from './features/lineage/LineageScreen';
import { GuardrailsScreen } from './features/guardrails/GuardrailsScreen';
import { ProtocolAnalysisScreen } from './features/protocol-analysis/ProtocolAnalysisScreen';
import { EvidencePackScreen } from './features/evidence-pack/EvidencePackScreen';
import { EnvironmentId, LineageBranch, NetworkNode, ScreenId } from './types';
import { cn } from './lib/utils';
import { Clock3, Play, Pause, RotateCcw, ShieldAlert, Download, Activity, Search } from 'lucide-react';

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live', label: 'Live Exercise' },
  { id: 'attack', label: 'Attack Forge' },
  { id: 'lineage', label: 'Lineage Graph' },
  { id: 'guardrails', label: 'Guardrails' },
  { id: 'analysis', label: 'Protocol Analysis' },
  { id: 'evidence', label: 'Evidence Pack' },
];

export default function App() {
  const { state, dispatch } = useAnvilSimulation();
  const [screen, setScreen] = useState<ScreenId>('overview');

  const selectedDetail = useMemo(() => {
    if (!state.selectedDetail) return null;
    if (state.selectedDetail.type === 'node') return state.nodes.find((item) => item.id === state.selectedDetail?.id);
    if (state.selectedDetail.type === 'branch') return state.lineageBranches.find((item) => item.id === state.selectedDetail?.id);
    if (state.selectedDetail.type === 'event') return state.attackEvents.find((item) => item.id === state.selectedDetail?.id);
    return null;
  }, [state.attackEvents, state.lineageBranches, state.nodes, state.selectedDetail]);

  const drawerTitle =
    state.selectedDetail?.type === 'node'
      ? 'Network node'
      : state.selectedDetail?.type === 'branch'
        ? 'Lineage branch'
        : state.selectedDetail?.type === 'event'
          ? 'Attack event'
          : 'Detail';

  const content = (() => {
    switch (screen) {
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
            onLaunch={() => dispatch({ type: 'inject-attack' })}
          />
        );
      case 'attack':
        return <AttackForgeScreen state={state} />;
      case 'lineage':
        return <LineageScreen state={state} onSelect={(branch) => dispatch({ type: 'select-detail', detail: { type: 'branch', id: branch.id } })} />;
      case 'guardrails':
        return <GuardrailsScreen state={state} />;
      case 'analysis':
        return <ProtocolAnalysisScreen state={state} />;
      case 'evidence':
        return <EvidencePackScreen state={state} onExport={() => dispatch({ type: 'export' })} />;
      default:
        return null;
    }
  })();

  return (
    <div className="app-shell min-h-full text-slate-100">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="border-r border-white/8 bg-[#0b0f13]/90 p-4 shadow-2xl backdrop-blur-xl xl:min-h-screen">
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-white/3 to-white/0 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.42em] text-amber-200/90">ANVIL</div>
                <div className="h-2.5 w-2.5 rounded-full bg-trust shadow-[0_0_0_6px_rgba(79,208,176,0.08)] animate-pulseSoft" />
              </div>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-white">ANVIL</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">Lineage contested-spectrum validation console</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition',
                    screen === item.id ? 'bg-amber-500/12 text-white ring-1 ring-amber-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
                  )}
                >
                  <span>{item.label}</span>
                  {screen === item.id ? <span className="text-[10px] uppercase tracking-[0.24em] text-amber-200">active</span> : null}
                </button>
              ))}
            </nav>
            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="micro-label">Environment selector</div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  ['surface-rf', 'Surface RF'],
                  ['ground-air', 'Ground / Air'],
                  ['space', 'Space'],
                  ['subsurface', 'Subsurface'],
                  ['mesh-relay', 'Mesh Relay'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => dispatch({ type: 'set-environment', environment: id as EnvironmentId })}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left text-sm transition',
                      state.environment === id ? 'border-amber-500/30 bg-amber-500/10 text-white' : 'border-white/6 bg-black/20 text-slate-300 hover:bg-white/5',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="micro-label">Exercise status</div>
              <div className="mt-3 space-y-2">
                <div className="text-base font-semibold text-white">{state.scenario.title}</div>
                <div className="text-sm text-slate-400">{state.scenario.subtitle}</div>
                <StatusLine label="Threat pressure" value={`${Math.round(state.threatPressure)}`} />
                <StatusLine label="Trust state" value={state.trustState} />
                <StatusLine label="Time elapsed" value={`${state.timeElapsed}s`} />
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0">
          <div className="sticky top-0 z-20 border-b border-white/8 bg-[#0a0e12]/80 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="amber">{state.scenario.title}</Badge>
                  <Badge tone="muted">{state.scenario.doctrine}</Badge>
                  <Badge tone="success">{state.scenario.environment.replace('-', ' ')}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {state.scenario.tags.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode: {state.mode}</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Confidence: {Math.round(state.confidence)}%</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" onClick={() => dispatch({ type: state.isRunning ? 'pause' : 'run' })}>
                  {state.isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {state.isRunning ? 'Pause' : 'Run'}
                </Button>
                <Button variant="ghost" onClick={() => dispatch({ type: 'reset' })}>
                  <RotateCcw size={16} />
                  Reset
                </Button>
                <Button variant="danger" onClick={() => dispatch({ type: 'inject-attack' })}>
                  <ShieldAlert size={16} />
                  Inject Attack
                </Button>
                <Button variant="amber" onClick={() => dispatch({ type: 'export' })}>
                  <Download size={16} />
                  Export Evidence
                </Button>
                <Badge tone={state.confidence > 75 ? 'success' : state.confidence > 48 ? 'warn' : 'danger'}>Confidence {Math.round(state.confidence)}%</Badge>
                <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : 'success'}>{state.mode}</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-6 px-4 py-5 lg:px-6">
            {content}
          </div>
        </main>
      </div>
      <Drawer
        open={Boolean(state.selectedDetail)}
        title={drawerTitle}
        onClose={() => dispatch({ type: 'select-detail', detail: undefined })}
      >
        {selectedDetail ? <DetailView item={selectedDetail} /> : null}
      </Drawer>
      {state.exportStatus === 'success' ? <ExportToast /> : null}
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/20 px-3 py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function DetailView({ item }: { item: NetworkNode | LineageBranch | { time: string; severity: string; source: string; message: string; trustImpact: number } }) {
  if ('lineageState' in item) {
    return (
      <div className="space-y-3 text-sm">
        <DetailRow label="Node" value={item.label} />
        <DetailRow label="Role" value={item.role} />
        <DetailRow label="Trust" value={`${item.trust}%`} />
        <DetailRow label="Lineage state" value={item.lineageState} />
      </div>
    );
  }
  if ('acceptanceReason' in item) {
    return (
      <div className="space-y-3 text-sm">
        <DetailRow label="Epoch" value={item.epoch} />
        <DetailRow label="Status" value={item.status} />
        <DetailRow label="Trust" value={`${item.trust}%`} />
        <DetailRow label="Acceptance reason" value={item.acceptanceReason} />
        <DetailRow label="Successor state" value={item.successorState} />
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm">
      <DetailRow label="Time" value={item.time} />
      <DetailRow label="Severity" value={item.severity} />
      <DetailRow label="Source" value={item.source} />
      <DetailRow label="Message" value={item.message} />
      <DetailRow label="Trust impact" value={`${item.trustImpact}`} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-200">{value}</div>
    </div>
  );
}

function ExportToast() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-2xl border border-trust/20 bg-[#0b1116]/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3">
        <Activity className="text-trust" size={18} />
        <div>
          <div className="text-sm font-semibold text-white">Evidence pack export simulated</div>
          <div className="text-xs text-slate-400">Front-end only confirmation recorded locally.</div>
        </div>
      </div>
    </div>
  );
}
