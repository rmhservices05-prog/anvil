import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge, Button } from '../../components/ui';
import { AttackType, SimulationState } from '../../types';
import { attackPresets } from '../../data/mock';
import { Gauge, Radar, ShieldAlert, SlidersHorizontal } from 'lucide-react';

export function AttackForgeScreen({
  state,
  onToggleAttack,
  onChangeAttackParam,
  onInject,
  onSelectEvent,
}: {
  state: SimulationState;
  onToggleAttack: (attack: AttackType) => void;
  onChangeAttackParam: (key: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth', value: number) => void;
  onInject: () => void;
  onSelectEvent: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Attack Forge"
        title="Adversarial simulation workbench"
        description="Build an attack profile and inject it into the live session."
        tag="Workbench"
        icon={<ShieldAlert size={14} strokeWidth={2.2} className="text-[#4f8cff]" />}
      />

      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                <Radar size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
              </span>
              <div className="micro-label">Attack profile</div>
            </div>
            <div className="text-base font-semibold text-white">Choose primitives and tune pressure in one place</div>
          </div>
          <Badge tone={state.attackTypes.length > 0 ? 'warn' : 'muted'}>{state.attackTypes.length} armed</Badge>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <ShieldAlert size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Primitives</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {attackPresets.map((attack) => {
              const enabled = state.attackTypes.includes(attack.id);
              return (
                <button
                  key={attack.id}
                  onClick={() => onToggleAttack(attack.id)}
                  aria-pressed={enabled}
                  className={
                    enabled
                      ? 'rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left'
                      : 'rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5'
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-white">{attack.label}</div>
                    <Badge tone={enabled ? 'warn' : 'muted'}>{enabled ? 'armed' : 'idle'}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{attack.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
              <SlidersHorizontal size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
            </span>
            <div className="micro-label">Attack settings</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { key: 'attackIntensity', label: 'Intensity', value: state.attackIntensity },
              { key: 'attackPersistence', label: 'Persistence', value: state.attackPersistence },
              { key: 'attackCoordination', label: 'Coordination', value: state.attackCoordination },
              { key: 'attackStealth', label: 'Stealth', value: state.attackStealth },
            ].map((item) => (
              <div key={item.key} className="rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Gauge size={14} strokeWidth={2.2} className="text-[#4f8cff]" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.value}
                  onChange={(e) => onChangeAttackParam(item.key as 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth', Number(e.target.value))}
                  className="mt-3 h-2 w-full appearance-none rounded-full bg-white/6 accent-amber-500"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="danger" onClick={onInject}>
            <Gauge size={15} strokeWidth={2.2} className="text-[#4f8cff]" />
            Launch composite attack
          </Button>
          <Badge tone="warn">AI-generated adversary profile ready</Badge>
        </div>

      </Card>
    </div>
  );
}
