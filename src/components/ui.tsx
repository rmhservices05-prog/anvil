import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Button({
  children,
  variant = 'default',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'default' | 'ghost' | 'amber' | 'danger' | 'outline';
}) {
  const styles: Record<string, string> = {
    default: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    ghost: 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5',
    amber: 'bg-amber-600/90 text-white hover:bg-amber-500',
    danger: 'bg-hostile/90 text-white hover:bg-hostile',
    outline: 'border border-white/10 bg-transparent text-slate-200 hover:bg-white/5',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        'disabled:pointer-events-none disabled:opacity-50',
        styles[variant],
        className,
      )}
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
    muted: 'bg-white/6 text-slate-300 border-white/10',
    success: 'bg-trust/10 text-trust border-trust/20',
    danger: 'bg-hostile/10 text-hostile border-hostile/20',
    warn: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
    amber: 'bg-amber-500/15 text-amber-100 border-amber-500/20',
  };
  return <span className={cn('rounded-full border px-3 py-1 text-xs font-medium tracking-wide', styles[tone], className)}>{children}</span>;
}

export function Progress({
  value,
  tone = 'amber',
}: {
  value: number;
  tone?: 'amber' | 'trust' | 'hostile';
}) {
  const map = {
    amber: 'from-amber-500 via-amber-400 to-amber-200',
    trust: 'from-trust via-trust to-emerald-200',
    hostile: 'from-hostile via-hostile to-rose-300',
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/6">
      <div className={cn('h-full rounded-full bg-gradient-to-r transition-all', map[tone])} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/10 bg-[#0b0f13]/96 shadow-2xl backdrop-blur-xl transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="micro-label">Operator detail</div>
          <div className="text-lg font-semibold text-white">{title}</div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="thin-scrollbar h-[calc(100%-73px)] overflow-y-auto p-5">{children}</div>
    </div>
  );
}
