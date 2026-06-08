export type ScreenId =
  | 'overview'
  | 'live'
  | 'attack'
  | 'lineage'
  | 'guardrails'
  | 'analysis'
  | 'evidence';

export type EnvironmentId =
  | 'surface-rf'
  | 'ground-air'
  | 'space'
  | 'subsurface'
  | 'mesh-relay';

export type ExercisePhase =
  | 'nominal'
  | 'light-interference'
  | 'spoofing-onset'
  | 'mixed-attack'
  | 'fail-secure'
  | 'recovery';

export type AttackType =
  | 'spoofed-commands'
  | 'replay-attack'
  | 'burst-jamming'
  | 'bit-corruption'
  | 'reorder-attack'
  | 'authority-overwrite'
  | 'lineage-desync'
  | 'epoch-poisoning';

export type ProtocolName =
  | 'DQSP / Lineage'
  | 'AES-PSK'
  | 'AES-GCM'
  | 'ECDH + GCM'
  | 'ML-KEM + GCM';

export type TrustState = 'trusted' | 'degraded' | 'contested' | 'recovery' | 'fail-secure';
export type GuardrailState = 'retained' | 'contested' | 'locked' | 'revalidation-required';

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  environment: EnvironmentId;
  tags: string[];
  doctrine: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  role: 'control' | 'relay' | 'platform' | 'sensor' | 'adversary';
  trust: number;
  lineageState: 'verified' | 'contested' | 'stale' | 'quarantined' | 'recovered';
}

export interface NetworkLink {
  id: string;
  from: string;
  to: string;
  trusted: boolean;
  contested?: boolean;
  hostile?: boolean;
  intensity: number;
}

export interface AttackEvent {
  id: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  trustImpact: number;
}

export interface CommandAttempt {
  id: string;
  label: string;
  status: 'accepted' | 'rejected' | 'pending';
  auth: number;
  guardrail: number;
}

export interface TrustMetrics {
  verifiedCommandRate: number;
  rejectedHostileAttempts: number;
  integrityContinuity: number;
  authorityState: TrustState;
  guardrailLock: GuardrailState;
  lastVerifiedEpoch: string;
  lineageTick: number;
}

export interface ProtocolMetric {
  protocol: ProtocolName;
  survivesCorruption: number;
  handshakeDependency: number;
  perMessageAuth: number;
  captureExposure: number;
  recoveryUnderMixedAttack: number;
  authorityContinuity: number;
  usableDelivery: number;
  wrongAcceptance: number;
  failSecureTransitions: number;
  recoveryTime: number;
}

export interface TimeSeriesPoint {
  tick: string;
  jamming: number;
  corruption: number;
  spoof: number;
  reorder: number;
  recovery: number;
}

export interface LineageBranch {
  id: string;
  epoch: string;
  status: 'verified' | 'active' | 'stale' | 'rejected' | 'recovery' | 'quarantined';
  trust: number;
  acceptanceReason: string;
  successorState: string;
  x: number;
  y: number;
  parentId?: string;
}

export interface GuardrailItem {
  label: string;
  state: 'locked' | 'retained' | 'active' | 'stale';
  detail: string;
}

export interface SimulationState {
  scenario: Scenario;
  phase: ExercisePhase;
  environment: EnvironmentId;
  threatPressure: number;
  trustState: TrustState;
  attackTypes: AttackType[];
  attackIntensity: number;
  attackPersistence: number;
  attackCoordination: number;
  attackStealth: number;
  isRunning: boolean;
  timeElapsed: number;
  confidence: number;
  mode: 'Simulated' | 'Contested' | 'Recovery' | 'Fail-secure';
  metrics: TrustMetrics;
  nodes: NetworkNode[];
  links: NetworkLink[];
  attackEvents: AttackEvent[];
  commandAttempts: CommandAttempt[];
  protocolMetrics: ProtocolMetric[];
  lineageBranches: LineageBranch[];
  guardrails: GuardrailItem[];
  series: TimeSeriesPoint[];
  headline: string;
  selectedDetail?: {
    type: 'node' | 'event' | 'branch';
    id: string;
  };
  exportStatus: 'idle' | 'success';
}
