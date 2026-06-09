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
    <Card className="relative min-h-[520px] overflow-hidden border-white/[0.07] bg-[#171717]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%)]" />
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <div>
          <div className="micro-label">Scenario canvas</div>
          <div className="text-[13px] font-medium text-[#f3f3f3]">Network and attack pressure in motion</div>
        </div>
        <Badge tone="muted">Animated link flow</Badge>
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
                  className={cn(link.hostile ? 'stroke-[#d95c59]/75' : link.contested ? 'stroke-[#d7a84b]/65' : 'stroke-[#36b37e]/75')}
                  strokeWidth={link.intensity * 5 + 1}
                  strokeLinecap="round"
                  strokeDasharray={link.hostile ? '8 10' : link.contested ? '4 8' : '0'}
                />
                <circle
                  cx={`${to.x}%`}
                  cy={`${to.y}%`}
                  r="2.25%"
                  className={cn(link.hostile ? 'fill-[#d95c59]/35' : link.contested ? 'fill-[#d7a84b]/28' : 'fill-[#36b37e]/22')}
                />
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
                'relative rounded-[4px] border px-3 py-3 transition',
                node.role === 'adversary'
                  ? 'border-[#6d3a38] bg-[#241716]'
                  : node.lineageState === 'contested'
                    ? 'border-[#6b5323] bg-[#241d11]'
                    : node.lineageState === 'quarantined'
                      ? 'border-white/[0.08] bg-[#121212]'
                      : 'border-white/[0.08] bg-[#121212]',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2.5 w-2.5 animate-pulseSoft rounded-full',
                    node.role === 'adversary'
                      ? 'bg-[#d95c59]'
                      : node.lineageState === 'contested'
                        ? 'bg-[#d7a84b]'
                        : node.lineageState === 'recovered'
                          ? 'bg-[#36b37e]'
                          : 'bg-[#7d7d7d]',
                  )}
                />
                <div>
                  <div className="text-[12px] font-medium text-[#f3f3f3]">{node.label}</div>
                  <div className="text-[11px] text-[#8c8c8c]">
                    {node.lineageState.replace('-', ' ')} · {node.trust}%
                  </div>
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
