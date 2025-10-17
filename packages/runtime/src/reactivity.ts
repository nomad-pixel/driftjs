import { devtools } from './devtools';

type EffectFn = () => void;
type ComputedFn<T> = () => T;

let CURRENT_EFFECT: EffectFn | null = null;
let BATCH_QUEUE: EffectFn[] = [];
let BATCH_SCHEDULED = false;
let SIGNAL_COUNTER = 0;
let EFFECT_COUNTER = 0;

export function effect(fn: EffectFn): () => void {
  const effectId = ++EFFECT_COUNTER;
  const effectName = `effect-${effectId}`;
  
  const runner = () => {
    cleanup(runner);
    CURRENT_EFFECT = runner;
    try { 
      fn(); 
      devtools.updateEffect(runner);
    } finally { 
      CURRENT_EFFECT = null; 
    }
  };
  (runner as any).deps = new Set<Set<EffectFn>>();
  (runner as any).disposed = false;
  Object.defineProperty(runner, 'name', { value: effectName, writable: true });
  
  devtools.trackEffect(runner, effectName, []);
  runner();
  
  return () => {
    (runner as any).disposed = true;
    devtools.updateEffect(runner, true);
    cleanup(runner);
  };
}

function cleanup(runner: EffectFn & { deps?: Set<Set<EffectFn>>; disposed?: boolean }) {
  if (runner.disposed) return;
  runner.deps?.forEach(d => d.delete(runner));
  runner.deps?.clear();
}

function scheduleEffect(fn: EffectFn) {
  if (BATCH_QUEUE.includes(fn)) return;
  BATCH_QUEUE.push(fn);
  
  if (!BATCH_SCHEDULED) {
    BATCH_SCHEDULED = true;
    Promise.resolve().then(() => {
      const effects = BATCH_QUEUE.slice();
      BATCH_QUEUE.length = 0;
      BATCH_SCHEDULED = false;
      effects.forEach(effect => effect());
    });
  }
}

export function createSignal<T>(initial: T, name?: string) {
  let value = initial;
  const subs = new Set<EffectFn>();
  const signalId = ++SIGNAL_COUNTER;
  const signalName = name || `signal-${signalId}`;

  const get = () => {
    if (CURRENT_EFFECT) {
      subs.add(CURRENT_EFFECT);
      (CURRENT_EFFECT as any).deps?.add(subs);
      
      const effectName = (CURRENT_EFFECT as any).name;
      if (effectName) {
        devtools.trackEffect(CURRENT_EFFECT, effectName, [signalName]);
      }
    }
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const newValue = typeof next === 'function' ? (next as any)(value) : next;
    if (Object.is(value, newValue)) return;
    value = newValue;
    
    devtools.trackSignal(get, signalName, value, subs.size);
    
    subs.forEach(fn => scheduleEffect(fn));
  };

  devtools.trackSignal(get, signalName, value, 0);

  return [get, set] as const;
}

export function createComputed<T>(fn: ComputedFn<T>) {
  let value: T;
  let isInitialized = false;
  
  const get = () => {
    if (CURRENT_EFFECT) {
      if (!isInitialized) {
        isInitialized = true;
        effect(() => {
          value = fn();
        });
      }
    }
    return value;
  };
  
  return get;
}

export function batch(fn: () => void) {
  const wasBatching = BATCH_SCHEDULED;
  if (!wasBatching) {
    BATCH_QUEUE.length = 0;
    BATCH_SCHEDULED = true;
  }
  
  fn();
  
  if (!wasBatching) {
    const effects = BATCH_QUEUE.slice();
    BATCH_QUEUE.length = 0;
    BATCH_SCHEDULED = false;
    effects.forEach(effect => effect());
  }
}
