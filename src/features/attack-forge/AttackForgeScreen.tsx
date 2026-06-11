import { SectionHeader } from '../../components/SectionHeader';
import { Card, Badge, Button } from '../../components/ui';
import { ControlPanel } from '../../components/ControlPanel';
import { AttackType, SimulationState } from '../../types';
import { attackPresets } from '../../data/mock';
import { Radar, ShieldAlert } from 'lucide-react';

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

      <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]">
                  <Radar size={13} strokeWidth={2.2} className="text-[#4f8cff]" />
                </span>
                <div className="micro-label">Attack recipe builder</div>
              </div>
              <div className="text-base font-semibold text-white">Choose active primitives</div>
            </div>
            <Badge tone={state.attackTypes.length > 0 ? 'warn' : 'muted'}>{state.attackTypes.length} armed</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {attackPresets.map((attack) => {
              const enabled = state.attackTypes.includes(attack.id);
              return (
                <button
                  key={attack.id}
                  onClick={() => onToggleAttack(attack.id)}
                  className={enabled ? 'rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left' : 'rounded-xl border border-white/6 bg-black/20 p-3 text-left transition hover:border-amber-500/30 hover:bg-white/5'}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{attack.label}</div>
                    <Badge tone={enabled ? 'warn' : 'muted'}>{enabled ? 'armed' : 'idle'}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{attack.description}</p>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="danger" onClick={onInject}>
              Inject into session
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="micro-label">Attack settings</div>
          <ControlPanel
            active={state.attackTypes}
            onToggle={onToggleAttack}
            onLaunch={onInject}
            intensity={state.attackIntensity}
            persistence={state.attackPersistence}
            coordination={state.attackCoordination}
            stealth={state.attackStealth}
            onChange={onChangeAttackParam}
          />
          <div className="space-y-2">
            <div className="micro-label">Recent events</div>
            <div className="space-y-2">
              {state.timeline.slice(-3).reverse().map((entry) => (
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
          </div>
        </Card>
      </div>
    </div>
  );
}
