import { useEffect, useReducer, type Dispatch } from 'react';
import { parsePersistedState, persistState, reducer, createInitialState, type SessionAction } from '../lib/session-engine';
import type { SimulationState } from '../types';

const STORAGE_KEY = 'anvil.console.session.v2';

function loadInitialState(): SimulationState {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const restored = parsePersistedState(window.localStorage.getItem(STORAGE_KEY));
    return restored ?? createInitialState();
  } catch {
    return createInitialState();
  }
}

export function useAnvilSimulation() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, persistState(state));
    } catch {
      // Persistence is best-effort only.
    }
  }, [state]);

  return {
    state,
    dispatch: dispatch as Dispatch<SessionAction>,
  };
}
