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
export type SessionPhase = 'idle' | 'preparing' | 'connecting' | 'running' | 'degraded' | 'recovering' | 'exporting' | 'review';
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'lost';

export type SessionEventType =
  | 'session.started'
  | 'session.paused'
  | 'session.resumed'
  | 'session.reset'
  | 'attack.armed'
  | 'attack.injected'
  | 'link.state_changed'
  | 'lineage.branch_selected'
  | 'evidence.exported'
  | 'guardrail.violated'
  | 'guardrail.recovered'
  | 'protocol.filtered'
  | 'node.selected'
  | 'branch.selected'
  | 'event.selected'
  | 'evidence.selected'
  | 'scenario.selected'
  | 'sidebar.toggled'
  | 'layout.changed'
  | 'session.connected'
  | 'session.degraded'
  | 'session.recovering'
  | 'session.reviewed'
  | 'session.stepped'
  | 'session.exporting';

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

export interface EvidenceItem {
  id: string;
  title: string;
  timestamp: string;
  category: 'scenario' | 'timeline' | 'alert' | 'protocol' | 'lineage' | 'guardrail' | 'export';
  summary: string;
  severity: 'info' | 'warn' | 'critical';
  source: string;
  details: string;
}

export interface ConsoleAlert {
  id: string;
  level: 'info' | 'warn' | 'critical';
  title: string;
  message: string;
  acknowledged: boolean;
  timestamp: string;
}

export interface SessionTimelineEntry {
  id: string;
  timestamp: string;
  type: SessionEventType;
  title: string;
  details: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface PanelLayoutState {
  sidebarCollapsed: boolean;
  activeScreen: ScreenId;
  selectedDetail?: SelectedDetail | undefined;
  filters: {
    protocol?: ProtocolName | undefined;
    lineage?: LineageBranch['status'] | 'all' | undefined;
    comparisonMode?: boolean | undefined;
    alertsOnly?: boolean;
    reviewOnly?: boolean;
  };
  dockedPanels: {
    timeline: boolean;
    alerts: boolean;
    evidence: boolean;
  };
}

export interface WorkspaceState {
  selectedScenarioId: string;
  lastSessionId?: string | undefined;
  savedPreferences: {
    theme: 'console';
    density: 'compact' | 'balanced';
  };
  recentSessions: Array<{
    sessionId: string;
    scenarioId: string;
    endedAt: string;
    headline: string;
  }>;
  recentExports: Array<{
    exportId: string;
    generatedAt: string;
    sessionId: string;
    summary: string;
  }>;
}

export interface ExportPayload {
  version: string;
  generatedAt: string;
  session: {
    id: string;
    phase: SessionPhase;
    connection: ConnectionState;
    status: string;
    startedAt: string;
    updatedAt: string;
    reviewMode: boolean;
  };
  timeline: SessionTimelineEntry[];
  alerts: ConsoleAlert[];
  metrics: TrustMetrics;
  scenario: Scenario;
  selectedDetail?: SelectedDetail | undefined;
  evidence: EvidenceItem[];
  lineages: LineageBranch[];
  protocolSummary: ProtocolMetric[];
}

export interface SessionSummary {
  id: string;
  phase: SessionPhase;
  connection: ConnectionState;
  status: string;
  startedAt: string;
  updatedAt: string;
  step: number;
  reviewMode: boolean;
}

export type SelectedDetail =
  | { type: 'node'; id: string }
  | { type: 'event'; id: string }
  | { type: 'branch'; id: string }
  | { type: 'evidence'; id: string };

export interface TrustMetrics {
  verifiedCommandRate: number;
  rejectedHostileAttempts: number;
  integrityContinuity: number;
  authorityState: TrustState;
  guardrailLock: GuardrailState;
  lastVerifiedEpoch: string;
  lineageTick: number;
}

export interface WorkflowStep {
  id: ScreenId;
  label: string;
  detail: string;
  status: 'complete' | 'active' | 'queued';
}

export interface MissionAlert {
  id: string;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  driver: string;
}

export interface MissionBrief {
  label: string;
  value: string;
  detail: string;
  tone: 'trust' | 'amber' | 'hostile';
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
  screen: ScreenId;
  session: SessionSummary;
  connectionState: ConnectionState;
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
  summary: {
    sessionPhase: SessionPhase;
    connectionState: ConnectionState;
    alertCount: number;
    evidenceCount: number;
    selectedScenarioId: string;
    changed: string[];
  };
  workflow: WorkflowStep[];
  alerts: MissionAlert[];
  briefing: MissionBrief[];
  timeline: SessionTimelineEntry[];
  consoleAlerts: ConsoleAlert[];
  evidence: EvidenceItem[];
  exportStatus: 'idle' | 'success';
  exportPayload?: ExportPayload;
  workspace: WorkspaceState;
  layout: PanelLayoutState;
  selectedDetail?: SelectedDetail | undefined;
  reviewMode: boolean;
  sessionPhase: SessionPhase;
  persistenceKey: string;
}
