import { Badge } from './ui';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  tag,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tag?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon ? <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#2358ca]/35 bg-[#102247] text-[#4f8cff]')}>{icon}</span> : null}
          <div className="micro-label">{eyebrow}</div>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {tag ? <Badge tone="amber">{tag}</Badge> : null}
    </div>
  );
}
