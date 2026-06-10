import { describe, expect, it } from 'vitest';
import { createExportPayload, createInitialState, parsePersistedState, persistState, reducer } from './session-engine';

describe('session engine', () => {
  it('progresses through the session lifecycle', () => {
    const started = reducer(createInitialState(), { type: 'start-session' });
    expect(started.session.phase).toBe('preparing');
    expect(started.connectionState).toBe('connecting');

    const connected = reducer(started, { type: 'connect' });
    expect(connected.session.phase).toBe('running');
    expect(connected.connectionState).toBe('connected');

    const paused = reducer(connected, { type: 'pause' });
    expect(paused.session.phase).toBe('degraded');
    expect(paused.isRunning).toBe(false);

    const resumed = reducer(paused, { type: 'resume' });
    expect(resumed.session.phase).toBe('running');
    expect(resumed.isRunning).toBe(true);

    const stepped = reducer(resumed, { type: 'step' });
    expect(stepped.timeElapsed).toBe(resumed.timeElapsed + 1);
    expect(stepped.timeline.length).toBeGreaterThanOrEqual(resumed.timeline.length);
  });

  it('changes runtime when attacks are armed', () => {
    const initial = createInitialState();
    const armed = reducer(initial, { type: 'toggle-attack', attack: 'burst-jamming' });
    expect(armed.attackTypes).toContain('burst-jamming');
    expect(armed.threatPressure).toBeGreaterThan(initial.threatPressure);
  });

  it('tracks selection in the shared runtime', () => {
    const state = createInitialState();
    const nodeSelected = reducer(state, { type: 'select-node', id: 'relay' });
    expect(nodeSelected.selectedDetail).toEqual({ type: 'node', id: 'relay' });

    const branchSelected = reducer(nodeSelected, { type: 'select-branch', id: 'epoch-105' });
    expect(branchSelected.selectedDetail).toEqual({ type: 'branch', id: 'epoch-105' });

    const evidenceSelected = reducer(branchSelected, { type: 'select-evidence', id: branchSelected.evidence[0]!.id });
    expect(evidenceSelected.selectedDetail?.type).toBe('evidence');
  });

  it('creates a downloadable export payload', () => {
    const state = reducer(reducer(createInitialState(), { type: 'start-session' }), { type: 'connect' });
    const exporting = reducer(state, { type: 'export-evidence' });
    const payload = createExportPayload(exporting);

    expect(payload.version).toBe('1.0.0');
    expect(payload.session.phase).toBe('exporting');
    expect(payload.timeline.length).toBeGreaterThan(0);
    expect(payload.evidence.length).toBeGreaterThan(0);
    expect(payload.alerts.length).toBeGreaterThan(0);
  });

  it('persists and restores the console state', () => {
    const state = reducer(reducer(createInitialState(), { type: 'toggle-attack', attack: 'epoch-poisoning' }), { type: 'set-screen', screen: 'analysis' });
    const restored = parsePersistedState(persistState(state));

    expect(restored?.screen).toBe('analysis');
    expect(restored?.attackTypes).toContain('epoch-poisoning');
    expect(restored?.workspace.selectedScenarioId).toBe(state.workspace.selectedScenarioId);
  });

  it('resets to the expected baseline', () => {
    const mutated = reducer(createInitialState(), { type: 'toggle-attack', attack: 'spoofed-commands' });
    const reset = reducer(mutated, { type: 'reset' });

    expect(reset.screen).toBe('overview');
    expect(reset.attackTypes).toHaveLength(0);
    expect(reset.session.phase).toBe('idle');
    expect(reset.connectionState).toBe('disconnected');
  });

  it('keeps scenario switching coherent', () => {
    const switched = reducer(createInitialState(), { type: 'set-scenario', scenarioId: 'eastern-surface' });
    expect(switched.scenario.id).toBe('eastern-surface');
    expect(switched.workspace.selectedScenarioId).toBe('eastern-surface');
    expect(switched.screen).toBe('overview');
  });
});
