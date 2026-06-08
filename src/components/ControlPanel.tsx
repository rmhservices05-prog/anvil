import { AttackType } from '../types';
import { attackPresets } from '../data/mock';
import { Badge, Button, Card } from './ui';
import { cn } from '../lib/utils';

export function ControlPanel({
  active,
  onToggle,
  onLaunch,
  intensity,
  persistence,
  coordination,
  stealth,
  onChange,
}: {
  active: AttackType[];
  onToggle: (attack: AttackType) => void;
  onLaunch: () => void;
  intensity: number;
  persistence: number;
  coordination: number;
  stealth: number;
  onChange: (key: 'attackIntensity' | 'attackPersistence' | 'attackCoordination' | 'attackStealth', value: number) => void;
}) {
  const sliders = [
    { key: 'attackIntensity', label: 'Intensity', value: intensity },
    { key: 'attackPersistence', label: 'Persistence', value: persistence },
    { key: 'attackCoordination', label: 'Coordination', value: coordination },
    { key: 'attackStealth', label: 'Stealth', value: stealth },
  ] as const;
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="micro-label">Attack controls</div>
          <div className="text-base font-semibold text-white">Composite AI-generated attack composition</div>
        </div>
        <Badge tone="danger">{active.length} active</Badge>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {attackPresets.map((attack) => {
          const enabled = active.includes(attack.id);
          return (
            <button
              key={attack.id}
              onClick={() => onToggle(attack.id)}
              className={cn('rounded-xl border p-3 text-left transition', enabled ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/6 bg-white/3 hover:bg-white/5')}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-white">{attack.label}</div>
                <Badge tone={enabled ? 'danger' : 'muted'}>{enabled ? 'armed' : 'idle'}</Badge>
              </div>
              <div className="mt-2 text-xs leading-5 text-slate-400">{attack.description}</div>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sliders.map((item) => (
          <div key={item.key} className="rounded-xl border border-white/6 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.value}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={item.value}
              onChange={(e) => onChange(item.key, Number(e.target.value))}
              className="mt-3 h-2 w-full appearance-none rounded-full bg-white/6 accent-amber-500"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="danger" onClick={onLaunch}>Launch composite attack</Button>
        <Badge tone="warn">AI-generated adversary profile ready</Badge>
      </div>
    </Card>
  );
}
