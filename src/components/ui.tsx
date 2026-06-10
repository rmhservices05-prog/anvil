import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Button({
  children,
  variant = 'default',
  className,
  selected = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'default' | 'ghost' | 'amber' | 'danger' | 'outline';
  selected?: boolean;
}) {
  const styles: Record<string, string> = {
    default: 'border border-[#2d5fd6] bg-[#1f5fd1] text-white hover:bg-[#255fe0]',
    ghost: 'border border-white/[0.07] bg-[#151515] text-[#d6d6d6] hover:bg-[#1b1b1b]',
    amber: 'border border-[#7a5b22] bg-[#d7a84b] text-[#0b0b0b] hover:bg-[#e0b65c]',
    danger: 'border border-[#7f3836] bg-[#d95c59] text-white hover:bg-[#e06965]',
    outline: 'border border-white/[0.07] bg-[#101010] text-[#d6d6d6] hover:bg-[#171717]',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-medium tracking-normal transition',
        'disabled:pointer-events-none disabled:opacity-50',
        selected ? 'ring-1 ring-[#e0b466]/60' : '',
        styles[variant],
        className,
      )}
      aria-pressed={selected || undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card p-4', className)}>{children}</div>;
}

export function Badge({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: 'muted' | 'success' | 'danger' | 'warn' | 'amber';
  className?: string;
}) {
  const styles: Record<string, string> = {
    muted: 'bg-[#191919] text-[#bdbdbd] border-white/[0.08]',
    success: 'bg-[#102018] text-[#72c8a0] border-[#1f5f47]',
    danger: 'bg-[#241716] text-[#e28a86] border-[#6d3a38]',
    warn: 'bg-[#241d11] text-[#e0b466] border-[#6b5323]',
    amber: 'bg-[#221a10] text-[#e0b466] border-[#6b5323]',
  };
  return (
    <span className={cn('inline-flex items-center rounded-[4px] border px-2 py-1 text-[10px] font-medium tracking-[0.12em]', styles[tone], className)}>
      {children}
    </span>
  );
}

export function Progress({
  value,
  tone = 'amber',
}: {
  value: number;
  tone?: 'amber' | 'trust' | 'hostile';
}) {
  const map = {
    amber: 'bg-[#d7a84b]',
    trust: 'bg-[#36b37e]',
    hostile: 'bg-[#d95c59]',
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-white/[0.06]">
      <div className={cn('h-full rounded-[2px] transition-all', map[tone])} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Drawer({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/[0.08] bg-[#0d0d0d] shadow-none transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div>
          <div className="micro-label">Operator detail</div>
          <div className="text-sm font-semibold text-[#f3f3f3]">{title}</div>
          {subtitle ? <div className="mt-1 text-[11px] leading-5 text-[#8c8c8c]">{subtitle}</div> : null}
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="thin-scrollbar h-[calc(100%-73px)] overflow-y-auto p-5">{children}</div>
    </div>
  );
}
