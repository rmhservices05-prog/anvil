import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge, Button } from '../../components/ui';
import { SimulationState } from '../../types';
import { attackPresets } from '../../data/mock';

export function AttackForgeScreen({ state }: { state: SimulationState }) {
  const profile = [
    ['Doctrine', 'Adaptive mixed attack'],
    ['Target preference', 'Authority continuity and fallback pathways'],
    ['Adaptation rate', `${Math.max(1, Math.round(state.threatPressure / 12))}/5`],
    ['Deception bias', `${Math.round(state.attackStealth)}%`],
    ['Aggressiveness', `${Math.round(state.attackIntensity)}%`],
  ] as const;
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Attack Forge"
        title="Adversarial simulation workbench"
        description="Build attack recipes from primitives, inspect the adversary profile, and validate that the console handles AI-generated combinations without losing trusted authority."
        tag="Workbench"
      />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="micro-label">Attack recipe builder</div>
          <div className="grid gap-3 md:grid-cols-2">
            {attackPresets.map((attack) => (
              <div key={attack.id} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white">{attack.label}</div>
                  <Badge tone="danger">{attack.intent}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{attack.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/6 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="micro-label">Chain builder</div>
                <div className="text-sm text-slate-300">Compose a hostile sequence from selected primitives</div>
              </div>
              <Button variant="outline">Add primitive</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {state.attackTypes.slice(0, 4).map((attack) => (
                <Badge key={attack} tone="warn">{attack.replace('-', ' ')}</Badge>
              ))}
            </div>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="micro-label">AI-generated adversary profile</div>
          <div className="space-y-3">
            {profile.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
                <div className="mt-2 text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-hostile/20 bg-hostile/8 p-4">
            <div className="micro-label text-hostile/90">Expected intent</div>
            <div className="mt-2 text-sm leading-6 text-slate-200">
              deny command, force false command, trigger unsafe state, exhaust trust, split operator from platform
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
