import { Badge } from './ui';

export function SectionHeader({
  eyebrow,
  title,
  description,
  tag,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="micro-label">{eyebrow}</div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {tag ? <Badge tone="amber">{tag}</Badge> : null}
    </div>
  );
}
