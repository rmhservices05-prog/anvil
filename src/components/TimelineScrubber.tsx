import { ExercisePhase } from '../types';
import { Badge, Card } from './ui';

export function TimelineScrubber({
  phase,
  onChange,
}: {
  phase: ExercisePhase;
  onChange: (phase: ExercisePhase) => void;
}) {
  const phases: ExercisePhase[] = ['nominal', 'light-interference', 'spoofing-onset', 'mixed-attack', 'fail-secure', 'recovery'];
  const index = phases.indexOf(phase);
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="micro-label">Timeline scrubber</div>
          <div className="text-base font-semibold text-white">Scrub the exercise and reflow state across the console</div>
        </div>
        <Badge tone="amber">{phase.replace('-', ' ')}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {phases.map((item, i) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
              i <= index ? 'border-amber-500/30 bg-amber-500/10 text-white' : 'border-white/6 bg-white/3 text-slate-400'
            }`}
          >
            <div className="font-medium">{item.replace('-', ' ')}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em]">{String(i + 1).padStart(2, '0')}</div>
          </button>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={phases.length - 1}
        value={index}
        onChange={(e) => onChange(phases[Number(e.target.value)] ?? phase)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/6 accent-amber-500"
      />
    </Card>
  );
}
