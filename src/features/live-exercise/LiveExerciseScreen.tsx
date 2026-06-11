import { ScenarioCanvas } from '../../components/ScenarioCanvas';
import { TimelineScrubber } from '../../components/TimelineScrubber';
import { SectionHeader } from '../../components/SectionHeader';
import { Badge, Button, Card } from '../../components/ui';
import { AttackType, NetworkNode, SimulationState } from '../../types';
import { formatPercent } from '../../lib/seed';
import { Activity, Clock3, Gauge, Radar, ShieldAlert, Workflow } from 'lucide-react';
import type { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export function LiveExerciseScreen({
  state,
  onStart,
  onConnect,
  onPause,
  onResume,
  onStep,
  onToggleAttack,
  onChangeAttackParam,
  onChangePhase,
  onSelectNode,
  onSelectEvent,
  onInjectAttack,
}: {
  state: SimulationState;
  onStart: () => void;
  onConnect: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onToggleAttack: (attack: AttackType) => void;
  onChangeAttackParam: (key: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth', value: number) => void;
  onChangePhase: (phase: SimulationState['phase']) => void;
  onSelectNode: (node: NetworkNode) => void;
  onSelectEvent: (id: string) => void;
  onInjectAttack: () => void;
}) {
  const selectedNode = state.selectedDetail?.type === 'node' ? state.nodes.find((node) => node.id === state.selectedDetail?.id) : undefined;
  const liveTimeline = state.timeline.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Live Exercise"
        title="Interactive contested-spectrum simulation"
        description="Start, pause, step, and inject attacks to change the shared session."
        tag={state.session.phase}
        icon={<Radar size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />
      <TimelineScrubber phase={state.phase} onChange={onChangePhase} />

      <div className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
        <div className="space-y-4">
          <ScenarioCanvas
            nodes={state.nodes}
            links={state.links}
            selectedNodeId={selectedNode?.id}
            onSelectNode={onSelectNode}
            sessionPhase={state.session.phase}
            alertCount={state.summary.alertCount}
          />
        </div>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <Workflow size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Live state</div>
              </div>
              <div className="text-base font-semibold text-white">{state.mode}</div>
            </div>
            <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
          </div>
          <div className="grid gap-2">
            <MetricTile label="Confidence" value={formatPercent(state.confidence)} tone={state.confidence > 74 ? 'trust' : state.confidence > 48 ? 'amber' : 'hostile'} icon={<Gauge size={13} className="text-[#4f8cff]" />} />
            <MetricTile label="Threat pressure" value={`${Math.round(state.threatPressure)}`} tone={state.threatPressure > 60 ? 'hostile' : state.threatPressure > 32 ? 'amber' : 'trust'} icon={<ShieldAlert size={13} className="text-[#4f8cff]" />} />
            <MetricTile label="Connection" value={state.connectionState} tone={state.connectionState === 'connected' ? 'trust' : state.connectionState === 'degraded' ? 'amber' : 'hostile'} icon={<Activity size={13} className="text-[#4f8cff]" />} />
          </div>
          <div className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="micro-label">Selected node</div>
            {selectedNode ? (
              <div className="mt-2 space-y-1">
                <div className="text-sm font-semibold text-white">{selectedNode.label}</div>
                <div className="text-xs text-slate-400">
                  {selectedNode.role} · {selectedNode.lineageState} · {selectedNode.trust}%
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-400">Click a node to inspect it here.</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" onClick={onStart}><Activity size={15} className="text-[#4f8cff]" />Start</Button>
            <Button variant="outline" onClick={onConnect}><ShieldAlert size={15} className="text-[#4f8cff]" />Connect</Button>
            <Button variant="ghost" onClick={onPause}><Clock3 size={15} className="text-[#4f8cff]" />Pause</Button>
            <Button variant="ghost" onClick={onResume}><Clock3 size={15} className="text-[#4f8cff]" />Resume</Button>
            <Button variant="outline" onClick={onStep}><Clock3 size={15} className="text-[#4f8cff]" />Step</Button>
            <Button variant="amber" onClick={onInjectAttack}><Radar size={15} className="text-[#4f8cff]" />Inject</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro-label">Streaming response</div>
              <div className="text-base font-semibold text-white">Live attack effect</div>
            </div>
            <Badge tone={state.summary.alertCount > 0 ? 'warn' : 'success'}>{state.summary.alertCount} alerts</Badge>
          </div>
          <div className="h-[240px]">
            <LiveStateChart series={state.series} />
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <Clock3 size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Timeline</div>
              </div>
              <div className="text-base font-semibold text-white">Recent events</div>
            </div>
            <Button variant="outline" onClick={onStep}><Clock3 size={15} className="text-[#4f8cff]" />Advance</Button>
          </div>
          <div className="space-y-2">
            {liveTimeline.map((entry) => (
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

function LiveStateChart({ series }: { series: SimulationState['series'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="tick" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0b1116', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#e5e7eb' }} />
        <Line type="monotone" dataKey="recovery" stroke="#4fd0b0" strokeWidth={2.2} dot={false} />
        <Line type="monotone" dataKey="spoof" stroke="#ff6f61" strokeWidth={2.2} dot={false} />
        <Line type="monotone" dataKey="jamming" stroke="#f9a93a" strokeWidth={2.2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MetricTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: 'trust' | 'amber' | 'hostile';
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8c8c8c]">
        {icon ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">{icon}</span> : null}
        {label}
      </div>
      <div className={tone === 'trust' ? 'mt-2 text-lg font-semibold text-[#72c8a0]' : tone === 'amber' ? 'mt-2 text-lg font-semibold text-[#e0b466]' : 'mt-2 text-lg font-semibold text-[#e28a86]'}>
        {value}
      </div>
    </div>
  );
}
