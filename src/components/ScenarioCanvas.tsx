import { NetworkLink, NetworkNode } from '../types';
import { Badge, Card } from './ui';
import { cn } from '../lib/utils';

export function ScenarioCanvas({
  nodes,
  links,
  onSelectNode,
}: {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onSelectNode: (node: NetworkNode) => void;
}) {
  const coord = (x: number, y: number) => ({ left: `${x}%`, top: `${y}%` });
  return (
    <Card className="relative min-h-[520px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex items-center justify-between border-b border-white/6 px-4 py-4">
        <div>
          <div className="micro-label">Scenario canvas</div>
          <div className="text-base font-semibold text-white">Network, attack pressure, and lineage state in motion</div>
        </div>
        <Badge tone="amber">Animated link flow</Badge>
      </div>
      <div className="relative h-[460px]">
        <svg className="absolute inset-0 h-full w-full">
          {links.map((link) => {
            const from = nodes.find((node) => node.id === link.from);
            const to = nodes.find((node) => node.id === link.to);
            if (!from || !to) return null;
            return (
              <g key={link.id}>
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  className={cn(link.hostile ? 'stroke-hostile/80' : link.contested ? 'stroke-amber-300/70' : 'stroke-trust/80')}
                  strokeWidth={link.intensity * 5 + 1}
                  strokeLinecap="round"
                  strokeDasharray={link.hostile ? '8 10' : link.contested ? '4 8' : '0'}
                />
                <circle cx={`${to.x}%`} cy={`${to.y}%`} r="2.5%" className={cn(link.hostile ? 'fill-hostile/50' : link.contested ? 'fill-amber-300/35' : 'fill-trust/30')} />
              </g>
            );
          })}
        </svg>
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => onSelectNode(node)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-left focus:outline-none"
            style={coord(node.x, node.y)}
          >
            <div
              className={cn(
                'relative rounded-2xl border px-3 py-3 shadow-lg backdrop-blur-md transition',
                node.role === 'adversary'
                  ? 'border-hostile/40 bg-hostile/10'
                  : node.lineageState === 'contested'
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : node.lineageState === 'quarantined'
                      ? 'border-hostile/30 bg-white/5'
                      : 'border-white/8 bg-black/30',
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full animate-pulseSoft', node.role === 'adversary' ? 'bg-hostile' : node.lineageState === 'contested' ? 'bg-amber-300' : node.lineageState === 'recovered' ? 'bg-trust' : 'bg-trust/70')} />
                <div>
                  <div className="text-sm font-semibold text-white">{node.label}</div>
                  <div className="text-xs text-slate-400">{node.lineageState} · {node.trust}%</div>
                </div>
              </div>
            </div>
          </button>
        ))}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge tone="success">Trusted path</Badge>
          <Badge tone="warn">Contested path</Badge>
          <Badge tone="danger">Hostile pulse</Badge>
        </div>
      </div>
    </Card>
  );
}
