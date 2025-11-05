import { devtools } from "./devtools";

type EffectFn = (() => void | (() => void)) | (() => Promise<void> | (() => void));
type ComputedFn<T> = () => T | Promise<T>;

export enum EffectPriority {
  IMMEDIATE = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  DEFERRED = 4
}

export interface EffectOptions {
  priority?: EffectPriority;
  lazy?: boolean;
  name?: string;
  onError?: (error: Error) => void;
}

type EffectRunner = EffectFn & {
  deps?: Set<Set<EffectRunner>>;
  disposed?: boolean;
  name?: string;
  priority?: EffectPriority;
  cleanup?: () => void;
  errorHandler?: (error: Error) => void;
  _isEffect?: boolean;
  _runOnce?: boolean;
};

let CURRENT_EFFECT: EffectRunner | null = null;
let SIGNAL_COUNTER = 0;
let EFFECT_COUNTER = 0;

const BATCH_QUEUES = new Map<EffectPriority, Set<EffectRunner>>();
const BATCH_SCHEDULED = new Set<EffectPriority>();
const COMPONENT_CONTEXTS = new WeakMap<any, Set<EffectRunner>>();

const PRIORITY_ORDER = [
  EffectPriority.IMMEDIATE,
  EffectPriority.HIGH,
  EffectPriority.NORMAL,
  EffectPriority.LOW,
  EffectPriority.DEFERRED
];

const requestIdleCallback = 
  (globalThis as any).requestIdleCallback || 
  ((cb: (deadline: IdleDeadline) => void, options?: { timeout?: number }) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, options?.timeout || 1);
  });

function getQueueForPriority(priority: EffectPriority): Set<EffectRunner> {
  if (!BATCH_QUEUES.has(priority)) {
    BATCH_QUEUES.set(priority, new Set());
  }
  return BATCH_QUEUES.get(priority)!;
}

function scheduleEffect(runner: EffectRunner, priority: EffectPriority = EffectPriority.NORMAL) {
  const queue = getQueueForPriority(priority);
  
  if (queue.has(runner)) return;
  queue.add(runner);

  if (!BATCH_SCHEDULED.has(priority)) {
    BATCH_SCHEDULED.add(priority);
    
    if (priority === EffectPriority.IMMEDIATE) {
      flushEffects(priority);
    } else if (priority === EffectPriority.DEFERRED) {
      requestIdleCallback(() => flushEffects(priority), { timeout: 5000 });
    } else {
      Promise.resolve().then(() => flushEffects(priority));
    }
  }
}

function flushEffects(priority: EffectPriority) {
  const queue = getQueueForPriority(priority);
  if (queue.size === 0) {
    BATCH_SCHEDULED.delete(priority);
    return;
  }

  const effects = Array.from(queue);
  queue.clear();
  BATCH_SCHEDULED.delete(priority);

  effects.forEach((effect) => {
    if (!effect.disposed) {
      try {
        effect();
      } catch (error) {
        if (effect.errorHandler) {
          effect.errorHandler(error as Error);
        } else {
          console.error(`Effect ${effect.name || 'unnamed'} error:`, error);
        }
      }
    }
  });
}

function flushAllEffects() {
  PRIORITY_ORDER.forEach(priority => {
    if (BATCH_SCHEDULED.has(priority)) {
      flushEffects(priority);
    }
  });
}

function cleanup(runner: EffectRunner) {
  if (runner.disposed) return;
  
  if (runner.cleanup) {
    try {
      runner.cleanup();
    } catch (error) {
      console.error(`Cleanup error for effect ${runner.name || 'unnamed'}:`, error);
    }
    runner.cleanup = undefined;
  }

  if (runner.deps) {
    runner.deps.forEach((d) => d.delete(runner));
    runner.deps.clear();
  }
}

export function effect(
  fn: EffectFn,
  deps?: any[]
): () => void {
  const effectId = ++EFFECT_COUNTER;
  const effectName = `effect-${effectId}`;
  const isInComponent = CURRENT_COMPONENT_CONTEXT !== null;
  const hasDeps = deps !== undefined;
  const effectIndex = isInComponent ? CURRENT_COMPONENT_EFFECT_INDEX++ : -1;

  let cleanupFn: (() => void) | undefined;
  let prevDeps: any[] | undefined = hasDeps ? deps.map(dep => {
    if (dep && typeof dep === 'object' && 'value' in dep) {
      return (dep as any).value;
    }
    return dep;
  }) : undefined;
  let isFirstRun = true;

  const runEffect = () => {
    if (isFirstRun) {
      isFirstRun = false;
    } else {
      if (cleanupFn) {
        try {
          cleanupFn();
        } catch (error) {
          console.error(`Cleanup error in effect ${effectName}:`, error);
        }
        cleanupFn = undefined;
      }
    }

    const prevEffect = CURRENT_EFFECT;
    
    if (!hasDeps) {
      CURRENT_EFFECT = runner;
    } else {
      CURRENT_EFFECT = null;
    }

    try {
      const result = fn();
      
      if (result instanceof Promise) {
        result.then((cleanup) => {
          if (typeof cleanup === 'function') {
            cleanupFn = cleanup;
          }
        }).catch((error) => {
          console.error(`Effect ${effectName} error:`, error);
        });
      } else {
        if (typeof result === 'function') {
          cleanupFn = result;
        }
      }
    } catch (error) {
      console.error(`Effect ${effectName} error:`, error);
    } finally {
      CURRENT_EFFECT = prevEffect;
    }
  };

  const runner: EffectRunner = () => {
    if (runner.disposed) return;

    if (hasDeps) {
      if (deps!.length === 0) {
        if (!isFirstRun) return;
      } else {
        const currentDeps = deps!.map(dep => {
          if (dep && typeof dep === 'object' && 'value' in dep) {
            return (dep as any).value;
          }
          return dep;
        });
        
        const depsChanged = prevDeps === undefined ||
          prevDeps.length !== currentDeps.length ||
          currentDeps.some((dep, i) => !Object.is(dep, prevDeps![i]));
        
        if (!depsChanged && !isFirstRun) {
          return;
        }
        
        prevDeps = currentDeps;
      }
    }

    runEffect();
  };

  runner._isEffect = true;
  runner.deps = new Set();
  runner.disposed = false;
  runner.priority = EffectPriority.NORMAL;

  Object.defineProperty(runner, "name", {
    value: effectName,
    writable: true,
    configurable: true
  });

  devtools.trackEffect(runner, effectName, []);

  const depsCleanups: (() => void)[] = [];
  
  if (hasDeps && deps!.length === 0) {
    runner._runOnce = true;
    scheduleEffect(runner, EffectPriority.NORMAL);
  } else if (hasDeps && deps!.length > 0) {
    const checkDeps = () => {
      const currentDeps = deps!.map(d => {
        if (d && typeof d === 'object' && 'value' in d) {
          return (d as any).value;
        }
        return d;
      });
      const changed = prevDeps === undefined ||
        prevDeps.length !== currentDeps.length ||
        currentDeps.some((d, i) => !Object.is(d, prevDeps![i]));
      if (changed) {
        prevDeps = currentDeps;
        scheduleEffect(runner, EffectPriority.NORMAL);
      }
    };
    
    deps!.forEach((dep) => {
      if (dep && typeof dep === 'object') {
        const stateDep = dep as any;
        if (!stateDep._subscribers) {
          return;
        }
        const depWatcher: EffectRunner = () => {
          if (!depWatcher.disposed) {
            checkDeps();
          }
        };
        depWatcher._isEffect = true;
        depWatcher.deps = new Set();
        depWatcher.disposed = false;
        depWatcher.priority = EffectPriority.HIGH;
        Object.defineProperty(depWatcher, "name", {
          value: `${effectName}-watcher`,
          writable: true,
          configurable: true
        });
        stateDep._subscribers.add(depWatcher);
        (runner as any)._depsWatchers = (runner as any)._depsWatchers || [];
        (runner as any)._depsWatchers.push(depWatcher);
        depsCleanups.push(() => {
          depWatcher.disposed = true;
          stateDep._subscribers.delete(depWatcher);
        });
      }
    });
    
    scheduleEffect(runner, EffectPriority.NORMAL);
  } else {
    scheduleEffect(runner, EffectPriority.NORMAL);
  }

  const cleanupFunction = () => {
    if (runner.disposed) return;
    
    
    runner.disposed = true;
    
    depsCleanups.forEach(cleanup => cleanup());
    
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (error) {
        console.error(`Cleanup error in effect ${effectName}:`, error);
      }
    }
    
    cleanup(runner);
    devtools.updateEffect(runner, true);
    
    getQueueForPriority(EffectPriority.NORMAL).delete(runner);
  };

  if (isInComponent && CURRENT_COMPONENT_CONTEXT) {
    CURRENT_COMPONENT_CONTEXT.add(cleanupFunction);
  }

  return cleanupFunction;
}

let componentEffectCounter = 0;

const componentStateStorage = new Map<string, StateVariable<any>[]>();
const componentComputedStorage = new Map<string, any[]>();

export function cleanupComponentState(instanceKey: string) {
  componentStateStorage.delete(instanceKey);
  const computeds = componentComputedStorage.get(instanceKey);
  if (computeds) {
    computeds.forEach(computedFn => {
      if (computedFn && typeof computedFn === 'function' && (computedFn as any)._runner) {
        const runner = (computedFn as any)._runner as EffectRunner;
        runner.disposed = true;
        const closure = (runner as any)._closure;
        if (closure) {
          closure.currentPromise = null;
          closure.isPending = false;
        }
      }
    });
  }
}

let CURRENT_COMPONENT_CONTEXT: Set<() => void> | null = null;
let CURRENT_COMPONENT_EFFECT_INDEX = 0;
let CURRENT_COMPONENT_STATE_INDEX = 0;
let CURRENT_COMPONENT_COMPUTED_INDEX = 0;
let CURRENT_COMPONENT_INSTANCE_KEY: string | null = null;

export function setComponentContext(context: Set<() => void> | null, effectIndex: number = 0, instanceKey: string | null = null) {
  CURRENT_COMPONENT_CONTEXT = context;
  CURRENT_COMPONENT_EFFECT_INDEX = effectIndex;
  CURRENT_COMPONENT_STATE_INDEX = 0;
  CURRENT_COMPONENT_COMPUTED_INDEX = 0;
  CURRENT_COMPONENT_INSTANCE_KEY = instanceKey;
}

export function getComponentContext(): Set<() => void> | null {
  return CURRENT_COMPONENT_CONTEXT;
}

export function getComponentEffectIndex(): number {
  return CURRENT_COMPONENT_EFFECT_INDEX;
}

export function getComponentInstanceKey(): string | null {
  return CURRENT_COMPONENT_INSTANCE_KEY;
}

export function untrack<T>(fn: () => T): T {
  const prevEffect = CURRENT_EFFECT;
  CURRENT_EFFECT = null;
  try {
    return fn();
  } finally {
    CURRENT_EFFECT = prevEffect;
  }
}

export function trackComponentEffect(component: any, runner: EffectRunner) {
  if (!COMPONENT_CONTEXTS.has(component)) {
    COMPONENT_CONTEXTS.set(component, new Set());
  }
  COMPONENT_CONTEXTS.get(component)!.add(runner);
}

export function cleanupComponentEffects(component: any) {
  const effects = COMPONENT_CONTEXTS.get(component);
  if (effects) {
    effects.forEach((effect) => {
      if (typeof effect === 'function' && '_isEffect' in effect) {
        (effect as EffectRunner).disposed = true;
        cleanup(effect as EffectRunner);
      }
    });
    effects.clear();
    COMPONENT_CONTEXTS.delete(component);
  }
}

export function computed<T>(fn: ComputedFn<T>, name?: string) {
  if (CURRENT_COMPONENT_INSTANCE_KEY !== null) {
    if (!componentComputedStorage.has(CURRENT_COMPONENT_INSTANCE_KEY)) {
      componentComputedStorage.set(CURRENT_COMPONENT_INSTANCE_KEY, []);
    }
    const computeds = componentComputedStorage.get(CURRENT_COMPONENT_INSTANCE_KEY)!;
    const computedIndex = CURRENT_COMPONENT_COMPUTED_INDEX++;
    
    if (computeds[computedIndex]) {
      const existingComputed = computeds[computedIndex] as (() => T);
      const existingRunner = (existingComputed as any)._runner as EffectRunner;
      if (existingRunner) {
        const existingData = (existingComputed as any)._data;
        if (existingData) {
          const closure = (existingRunner as any)._closure;
          if (closure) {
            if (existingRunner.disposed) {
              existingRunner.disposed = false;
              const hadValue = closure.value !== undefined && closure.value !== null;
              const hadPreviousValue = closure.previousValue !== undefined && closure.previousValue !== null;
              
              if (!hadValue) {
                if (existingData.value !== undefined && existingData.value !== null) {
                  closure.value = existingData.value;
                }
              } else {
                console.log(`[${existingRunner.name}] Keeping existing value in closure:`, closure.value);
              }
              
              if (!hadPreviousValue) {
                if (existingData.previousValue !== undefined && existingData.previousValue !== null) {
                  closure.previousValue = existingData.previousValue;
                }
                if (closure.value !== undefined && closure.value !== null && closure.previousValue === undefined) {
                  closure.previousValue = closure.value;
                  console.log(`[${existingRunner.name}] Initialized previousValue from value during restoration`);
                }
              } else {
                console.log(`[${existingRunner.name}] Keeping existing previousValue in closure:`, closure.previousValue);
              }
              
              if (closure.currentPromise) {
                console.log(`[${existingRunner.name}] Has pending Promise, will wait for it in background`);
                const pendingPromise = closure.currentPromise;
                closure.currentPromise = null;
                pendingPromise.then((pendingValue: T) => {
                  if (!existingRunner.disposed) {
                    if (closure.value === undefined || closure.value === null || 
                        (typeof pendingValue === 'object' && pendingValue !== null && 
                         typeof closure.value === 'object' && closure.value !== null &&
                         (pendingValue as any).id !== (closure.value as any).id)) {
                      console.log(`[${existingRunner.name}] Pending Promise resolved with newer value:`, pendingValue);
                      closure.value = pendingValue;
                      closure.previousValue = closure.previousValue || closure.value;
                      const currentSubs = (existingComputed as any)._subs as Set<EffectRunner>;
                      if (currentSubs) {
                        currentSubs.forEach((sub) => {
                          if (sub && !sub.disposed) {
                            scheduleEffect(sub, sub.priority ?? EffectPriority.NORMAL);
                          }
                        });
                      }
                    }
                  }
                }).catch((error: any) => {
                  console.error(`[${existingRunner.name}] Pending Promise error:`, error);
                });
              }
              
              closure.isPending = false;
              closure.currentPromise = null;
              console.log(`[${existingRunner.name}] Restored computed state: value:`, closure.value, 'previousValue:', closure.previousValue, 'isPending:', closure.isPending, 'hadValue:', hadValue);
              
              const restoredSubs = (existingComputed as any)._subs as Set<EffectRunner>;
              if (restoredSubs) {
                restoredSubs.clear();
                console.log(`[${existingRunner.name}] Cleared old subscribers - new effects will subscribe on next render`);
              }
              
              (existingRunner as any)._restorationRun = true;
              scheduleEffect(existingRunner, existingRunner.priority ?? EffectPriority.HIGH);
              console.log(`[${existingRunner.name}] Scheduled runner to re-subscribe to dependencies (restoration mode)`);
            } else {
              console.log(`[${existingRunner.name}] Computed already active, not restoring`);
            }
          }
        } else {
          if (existingRunner.disposed) {
            existingRunner.disposed = false;
            console.log(`[${existingRunner.name}] Restoring disposed computed (no saved data)`);
          }
        }
      }
      return existingComputed;
    }
  }
  
  const closure = {
    value: undefined as any as T,
    previousValue: undefined as any as T,
    isPending: false,
    currentPromise: null as Promise<T> | null
  };
  
  const subs = new Set<EffectRunner>();
  const computedId = ++SIGNAL_COUNTER;
  const computedName = name || `computed-${computedId}`;

  const runner: EffectRunner = async () => {
    if (runner.disposed) return;
    
    console.log(`[${computedName}] Runner called`);
    
    const previousPromise = closure.currentPromise;
    cleanup(runner);
    const prevEffect = CURRENT_EFFECT;
    CURRENT_EFFECT = runner;
    
    const isRestorationRun = (runner as any)._restorationRun;
    if (isRestorationRun) {
      (runner as any)._restorationRun = false;
      console.log(`[${computedName}] Restoration run - just subscribing to dependencies, not recalculating`);
      fn();
      CURRENT_EFFECT = prevEffect;
      return;
    }
    
    const previousValueBeforeUpdate = closure.previousValue;
    if (closure.value !== undefined && closure.value !== null) {
      closure.previousValue = closure.value;
      console.log(`[${computedName}] Saved previousValue:`, closure.previousValue, 'from value:', closure.value);
    }
    
    try {
      console.log(`[${computedName}] Calling fn(), CURRENT_EFFECT:`, CURRENT_EFFECT?.name);
      const result = fn();
      console.log(`[${computedName}] fn() returned:`, result instanceof Promise ? 'Promise' : result);
      
      if (result instanceof Promise) {
        const hasValue = closure.value !== undefined && closure.value !== null;
        const hasPreviousValue = closure.previousValue !== undefined && closure.previousValue !== null;
        
        closure.currentPromise = result;
        
        if (hasValue || hasPreviousValue) {
          console.log(`[${computedName}] Result is Promise, setting isPending = true (hasValue: ${hasValue}, hasPreviousValue: ${hasPreviousValue})`);
          closure.isPending = true;
        } else {
          console.log(`[${computedName}] Result is Promise, but no previous value, not setting isPending`);
        }
        
        subs.forEach((sub) => {
          if (sub && !sub.disposed) {
            scheduleEffect(sub, sub.priority ?? EffectPriority.NORMAL);
          }
        });
        
        try {
          console.log(`[${computedName}] Awaiting Promise...`);
          const newValue = await result;
          if (closure.currentPromise === result && !runner.disposed) {
            console.log(`[${computedName}] Promise resolved, newValue:`, newValue, 'currentPromise === result:', closure.currentPromise === result, 'disposed:', runner.disposed);
            closure.value = newValue;
            closure.isPending = false;
            closure.currentPromise = null;
            console.log(`[${computedName}] Updated value, isPending = false`);
            
            devtools.updateEffect(runner);
            
            subs.forEach((sub) => {
              if (sub && !sub.disposed) {
                scheduleEffect(sub, sub.priority ?? EffectPriority.NORMAL);
              }
            });
          } else if (closure.currentPromise !== result) {
            console.log(`[${computedName}] Promise resolved but was replaced by new one`);
            if (runner.disposed) {
              console.log(`[${computedName}] Runner was disposed, saving value for restoration`);
              closure.value = newValue;
              closure.isPending = false;
              closure.currentPromise = null;
            } else {
              console.log(`[${computedName}] Ignoring old result (new Promise active)`);
            }
          } else {
            console.log(`[${computedName}] Runner was disposed, but value was saved for restoration`);
            closure.value = newValue;
            closure.isPending = false;
            closure.currentPromise = null;
          }
        } catch (promiseError) {
          closure.isPending = false;
          closure.currentPromise = null;
          console.error(`Computed ${computedName} promise error:`, promiseError);
        }
      } else {
        console.log(`[${computedName}] Result is not Promise, setting value:`, result);
        if (!runner.disposed) {
          closure.value = result;
          devtools.updateEffect(runner);
          
          subs.forEach((sub) => {
            if (sub && !sub.disposed) {
              scheduleEffect(sub, sub.priority ?? EffectPriority.NORMAL);
            }
          });
        }
      }
    } catch (error) {
      if (!runner.disposed) {
        closure.isPending = false;
        console.error(`Computed ${computedName} error:`, error);
      }
    } finally {
      CURRENT_EFFECT = prevEffect;
    }
  };
  
  runner._isEffect = true;
  runner.deps = new Set();
  runner.disposed = false;
  runner.priority = EffectPriority.HIGH;
  
  Object.defineProperty(runner, "name", {
    value: computedName,
    writable: true,
    configurable: true
  });

  devtools.trackEffect(runner, computedName, []);

  runner();

  const get = (): T => {
    console.log(`[${computedName}] get() called, isPending:`, closure.isPending, 'previousValue:', closure.previousValue, 'value:', closure.value);
    
    if (CURRENT_EFFECT) {
      subs.add(CURRENT_EFFECT);
      if (CURRENT_EFFECT.deps) {
        CURRENT_EFFECT.deps.add(subs);
      }

      const effectName = CURRENT_EFFECT.name;
      if (effectName) {
        devtools.trackEffect(CURRENT_EFFECT, effectName, [computedName]);
      }
    }
    
    if (closure.isPending) {
      if (closure.previousValue !== undefined && closure.previousValue !== null) {
        console.log(`[${computedName}] Returning previousValue:`, closure.previousValue);
        return closure.previousValue;
      }
      if (closure.value !== undefined && closure.value !== null) {
        console.log(`[${computedName}] isPending, returning current value:`, closure.value);
        return closure.value;
      }
      console.log(`[${computedName}] isPending but no value, returning undefined`);
      return closure.value;
    }
    
    console.log(`[${computedName}] Returning value:`, closure.value);
    return closure.value;
  };
  
  (get as any)._runner = runner;
  (get as any)._subs = subs;
  (runner as any)._closure = closure;
  const dataStore = {
    value: closure.value,
    previousValue: closure.previousValue,
    isPending: closure.isPending
  };
  (get as any)._data = dataStore;
  
  Object.defineProperty(dataStore, 'value', {
    get: () => closure.value,
    set: (v) => { closure.value = v; },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(dataStore, 'previousValue', {
    get: () => closure.previousValue,
    set: (v) => { closure.previousValue = v; },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(dataStore, 'isPending', {
    get: () => closure.isPending,
    set: (v) => { closure.isPending = v; },
    enumerable: true,
    configurable: true
  });

  if (CURRENT_COMPONENT_INSTANCE_KEY !== null) {
    const computeds = componentComputedStorage.get(CURRENT_COMPONENT_INSTANCE_KEY)!;
    const computedIndex = CURRENT_COMPONENT_COMPUTED_INDEX - 1;
    computeds[computedIndex] = get;
  }

  return get;
}

export function batch(fn: () => void) {
  const wasBatching = BATCH_SCHEDULED.size > 0;
  
  if (!wasBatching) {
    PRIORITY_ORDER.forEach(priority => {
      getQueueForPriority(priority).clear();
    });
  }

  fn();

  if (!wasBatching) {
    flushAllEffects();
  }
}

type StateVariable<T> = {
  _value: T;
  _subscribers: Set<EffectRunner>;
  _name: string;
};

const STATE_REGISTRY = new WeakMap<StateVariable<any>, StateVariable<any>>();
let SET_STATE_ACTIVE = false;
let SET_STATE_CHANGED: Set<StateVariable<any>> | null = null;

type ExpandLiteral<T> = T extends number ? number : T extends string ? string : T extends boolean ? boolean : T;

function createStateProxy<T>(stateVar: StateVariable<T>): StateVariable<ExpandLiteral<T>> & ExpandLiteral<T> & { value: ExpandLiteral<T> } {
  const proxy = new Proxy(stateVar, {
    get(target, prop) {
      if (prop === '_value' || prop === '_subscribers' || prop === '_name') {
        return target[prop as keyof StateVariable<T>];
      }
      
      if (prop === 'value') {
        if (CURRENT_EFFECT) {
          target._subscribers.add(CURRENT_EFFECT);
          if ((CURRENT_EFFECT as any).deps) {
            (CURRENT_EFFECT as any).deps.add(target._subscribers);
          }
        }
        return target._value;
      }
      
      if (typeof target._value === 'object' && target._value !== null && prop in target._value) {
        if (CURRENT_EFFECT) {
          target._subscribers.add(CURRENT_EFFECT);
          (CURRENT_EFFECT as any).deps?.add(target._subscribers);
        }
        return (target._value as any)[prop];
      }
      
      if (prop === Symbol.toPrimitive) {
        return () => {
          if (CURRENT_EFFECT) {
            target._subscribers.add(CURRENT_EFFECT);
            (CURRENT_EFFECT as any).deps?.add(target._subscribers);
          }
          return target._value;
        };
      }
      
      return undefined;
    },
    set(target, prop, newValue) {
      if (prop === 'value' || prop === '_value') {
        if (Object.is(target._value, newValue)) return true;
        
        target._value = newValue as T;
        
        if (SET_STATE_ACTIVE && SET_STATE_CHANGED) {
          SET_STATE_CHANGED.add(target);
        } else {
          target._subscribers.forEach(fn => {
            if (!fn.disposed) {
              scheduleEffect(fn, fn.priority ?? EffectPriority.NORMAL);
            }
          });
        }
        
        return true;
      }
      
      if (typeof target._value === 'object' && target._value !== null && prop in target._value) {
        const oldValue = (target._value as any)[prop];
        if (Object.is(oldValue, newValue)) return true;
        
        (target._value as any)[prop] = newValue;
        
        if (SET_STATE_ACTIVE && SET_STATE_CHANGED) {
          SET_STATE_CHANGED.add(target);
        } else {
          target._subscribers.forEach(fn => {
            if (!fn.disposed) {
              scheduleEffect(fn, fn.priority ?? EffectPriority.NORMAL);
            }
          });
        }
        
        return true;
      }
      
      return false;
    }
  });
  
  Object.setPrototypeOf(proxy, Object.getPrototypeOf(stateVar));
  Object.defineProperty(proxy, 'value', {
    get() {
      if (CURRENT_EFFECT) {
        stateVar._subscribers.add(CURRENT_EFFECT);
        (CURRENT_EFFECT as any).deps?.add(stateVar._subscribers);
      }
      return stateVar._value;
    },
    set(newValue) {
      if (Object.is(stateVar._value, newValue)) return;
      
      if (stateVar._name && stateVar._name.includes('userId')) {
        console.log(`[${stateVar._name}] Changing value from`, stateVar._value, 'to', newValue, 'subscribers:', stateVar._subscribers.size);
      }
      
      stateVar._value = newValue;
      
      if (SET_STATE_ACTIVE && SET_STATE_CHANGED) {
        SET_STATE_CHANGED.add(stateVar);
      } else {
        stateVar._subscribers.forEach(fn => {
          if (stateVar._name && stateVar._name.includes('userId')) {
            console.log(`[${stateVar._name}] Scheduling effect:`, fn.name || 'unnamed');
          }
          scheduleEffect(fn);
        });
      }
    },
    enumerable: true,
    configurable: true
  });
  
  return proxy as StateVariable<ExpandLiteral<T>> & ExpandLiteral<T> & { value: ExpandLiteral<T> };
}

export function state<T>(initial: T, name?: string): StateVariable<ExpandLiteral<T>> & ExpandLiteral<T> & { value: ExpandLiteral<T> } {
  if (CURRENT_COMPONENT_INSTANCE_KEY !== null) {
    if (!componentStateStorage.has(CURRENT_COMPONENT_INSTANCE_KEY)) {
      componentStateStorage.set(CURRENT_COMPONENT_INSTANCE_KEY, []);
    }
    const states = componentStateStorage.get(CURRENT_COMPONENT_INSTANCE_KEY)!;
    const stateIndex = CURRENT_COMPONENT_STATE_INDEX++;
    
    if (states[stateIndex]) {
      return states[stateIndex] as StateVariable<ExpandLiteral<T>> & ExpandLiteral<T> & { value: ExpandLiteral<T> };
    }
    
    const stateId = ++SIGNAL_COUNTER;
    const stateName = name || `state-${stateId}`;
    
    const stateVar: StateVariable<T> = {
      _value: initial,
      _subscribers: new Set<EffectRunner>(),
      _name: stateName
    };
    
    STATE_REGISTRY.set(stateVar, stateVar);
    const proxy = createStateProxy(stateVar);
    states[stateIndex] = proxy;
    return proxy;
  }
  
  const stateId = ++SIGNAL_COUNTER;
  const stateName = name || `state-${stateId}`;
  
  const stateVar: StateVariable<T> = {
    _value: initial,
    _subscribers: new Set<EffectRunner>(),
    _name: stateName
  };
  
  STATE_REGISTRY.set(stateVar, stateVar);
  return createStateProxy(stateVar);
}

export function setState(fn: () => void) {
  const changedStates = new Set<StateVariable<any>>();
  SET_STATE_CHANGED = changedStates;
  SET_STATE_ACTIVE = true;
  
  try {
    fn();
  } finally {
    SET_STATE_ACTIVE = false;
    SET_STATE_CHANGED = null;
    
    batch(() => {
      changedStates.forEach(stateVar => {
        if (stateVar._name && stateVar._name.includes('userId')) {
          console.log(`[setState] Notifying ${stateVar._subscribers.size} subscribers for ${stateVar._name}`);
        }
        stateVar._subscribers.forEach(fn => {
          if (!fn.disposed) {
            if (stateVar._name && stateVar._name.includes('userId')) {
              console.log(`[setState] Scheduling effect:`, fn.name || 'unnamed');
            }
            scheduleEffect(fn, fn.priority ?? EffectPriority.NORMAL);
          }
        });
      });
    });
  }
}
