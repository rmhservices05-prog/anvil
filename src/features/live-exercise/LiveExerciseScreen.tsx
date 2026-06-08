import { ControlPanel } from '../../components/ControlPanel';
import { ScenarioCanvas } from '../../components/ScenarioCanvas';
import { TimelineScrubber } from '../../components/TimelineScrubber';
import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge } from '../../components/ui';
import { SimulationState, AttackType, NetworkNode } from '../../types';
import { formatPercent } from '../../lib/seed';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export function LiveExerciseScreen({
  state,
  onToggleAttack,
  onChangeAttackParam,
  onChangePhase,
  onSelectNode,
  onLaunch,
}: {
  state: SimulationState;
  onToggleAttack: (attack: AttackType) => void;
  onChangeAttackParam: (key: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth', value: number) => void;
  onChangePhase: (phase: SimulationState['phase']) => void;
  onSelectNode: (node: NetworkNode) => void;
  onLaunch: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Live Exercise"
        title="Interactive contested-spectrum simulation"
        description="Scrub phases, inject attacks, and watch metrics, logs, authority states, and lineage continuity update together in a single coherent view."
        tag={state.mode}
      />
      <TimelineScrubber phase={state.phase} onChange={onChangePhase} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ScenarioCanvas nodes={state.nodes} links={state.links} onSelectNode={onSelectNode} />
        <Card className="space-y-4">
          <div className="micro-label">Outcome matrix</div>
          <div className="grid gap-3">
            {[
              ['Authentication', state.metrics.verifiedCommandRate],
              ['Command continuity', state.metrics.integrityContinuity],
              ['Guardrail integrity', state.metrics.guardrailLock === 'locked' ? 96 : 88],
              ['Operator trust', state.confidence],
              ['Recovery path', state.phase === 'recovery' ? 92 : 61],
              ['Mission survivability', state.mode === 'Fail-secure' ? 88 : 76],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{label as string}</span>
                  <span className="text-sm font-semibold text-white">{formatPercent(Number(value))}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-trust" style={{ width: `${Number(value)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/6 bg-white/3 p-3">
            <div className="micro-label">Current mode</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge tone={state.mode === 'Fail-secure' ? 'danger' : state.mode === 'Recovery' ? 'amber' : 'success'}>{state.mode}</Badge>
              <span className="text-sm text-slate-400">Phase {state.phase.replace('-', ' ')}</span>
            </div>
          </div>
        </Card>
      </div>
      <ControlPanel
        active={state.attackTypes}
        onToggle={onToggleAttack}
        onLaunch={onLaunch}
        intensity={state.attackIntensity}
        persistence={state.attackPersistence}
        coordination={state.attackCoordination}
        stealth={state.attackStealth}
        onChange={onChangeAttackParam}
      />
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="micro-label">Streaming response</div>
            <div className="text-base font-semibold text-white">Reusable state reflow against active attack parameters</div>
          </div>
          <Badge tone="amber">Keyboard hint: space to pause</Badge>
        </div>
        <div className="h-[220px]">
          <LiveStateChart series={state.series} />
        </div>
      </Card>
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
