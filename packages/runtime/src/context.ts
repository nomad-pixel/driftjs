import { getComponentContext, setComponentContext, getComponentInstanceKey } from './reactivity';

export interface Context<T> {
  id: symbol;
  defaultValue: T;
  displayName?: string;
}

type ContextValue<T> = {
  value: T;
  instanceKey: string | null;
};

const CONTEXT_STORAGE = new Map<symbol, ContextValue<any>[]>();

export function createContext<T>(defaultValue: T, displayName?: string): Context<T> {
  return {
    id: Symbol(displayName || 'Context'),
    defaultValue,
    displayName
  };
}

export function provide<T>(context: Context<T>, value: T): void {
  const instanceKey = getComponentInstanceKey();
  
  if (!CONTEXT_STORAGE.has(context.id)) {
    CONTEXT_STORAGE.set(context.id, []);
  }
  
  const stack = CONTEXT_STORAGE.get(context.id)!;
  stack.push({ value, instanceKey });
}

export function inject<T>(context: Context<T>): T;
export function inject<T>(context: Context<T>, defaultValue: T): T;
export function inject<T>(context: Context<T>, defaultValue?: T): T {
  const stack = CONTEXT_STORAGE.get(context.id);
  
  if (!stack || stack.length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return context.defaultValue;
  }
  
  return stack[stack.length - 1].value;
}

export function cleanupContext(instanceKey: string): void {
  CONTEXT_STORAGE.forEach((stack, contextId) => {
    const filtered = stack.filter(item => item.instanceKey !== instanceKey);
    if (filtered.length === 0) {
      CONTEXT_STORAGE.delete(contextId);
    } else {
      CONTEXT_STORAGE.set(contextId, filtered);
    }
  });
}

export function hasContext<T>(context: Context<T>): boolean {
  const stack = CONTEXT_STORAGE.get(context.id);
  return !!stack && stack.length > 0;
}

export function getAllContexts(): Map<symbol, ContextValue<any>[]> {
  return CONTEXT_STORAGE;
}

type ProviderProps<T> = {
  value: T;
  children: any;
};

export function createProvider<T>(context: Context<T>) {
  return function Provider(props: ProviderProps<T>) {
    const savedContext = getComponentContext();
    const savedInstanceKey = getComponentInstanceKey();
    
    provide(context, props.value);
    
    const children = typeof props.children === 'function' 
      ? props.children() 
      : props.children;
    
    setComponentContext(savedContext, 0, savedInstanceKey);
    
    return children;
  };
}

