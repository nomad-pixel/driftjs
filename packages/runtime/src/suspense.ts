import { state, setState, effect } from './reactivity';
import { normalizeChild, type Child } from './dom';

export interface SuspenseProps {
  children?: any;
  fallback?: Child;
  onResolve?: () => void;
  onError?: (error: Error) => void;
}

type SuspenseState = 'pending' | 'resolved' | 'error';

interface SuspenseContext {
  promises: Set<Promise<any>>;
  addPromise: (promise: Promise<any>) => void;
  isPending: () => boolean;
}

const suspenseStack: SuspenseContext[] = [];

export function getCurrentSuspense(): SuspenseContext | null {
  return suspenseStack[suspenseStack.length - 1] || null;
}

function pushSuspense(context: SuspenseContext) {
  suspenseStack.push(context);
  (globalThis as any).__DRIFT_SUSPENSE_CONTEXT__ = context;
}

function popSuspense() {
  suspenseStack.pop();
  (globalThis as any).__DRIFT_SUSPENSE_CONTEXT__ = suspenseStack[suspenseStack.length - 1] || null;
}

export function Suspense(props: SuspenseProps): Node {
  const suspenseState = state<{
    status: SuspenseState;
    error: Error | null;
  }>({
    status: 'pending',
    error: null
  });

  const container = document.createElement('div');
  container.setAttribute('data-suspense', 'true');

  const promises = new Set<Promise<any>>();
  let isInitialRender = true;

  const suspenseContext: SuspenseContext = {
    promises,
    addPromise: (promise: Promise<any>) => {
      promises.add(promise);
      
      promise
        .then(() => {
          promises.delete(promise);
          if (promises.size === 0 && suspenseState.value.status === 'pending') {
            setState(() => {
              suspenseState.value = { status: 'resolved', error: null };
            });
            if (props.onResolve) {
              props.onResolve();
            }
          }
        })
        .catch((error) => {
          promises.delete(promise);
          setState(() => {
            suspenseState.value = { status: 'error', error };
          });
          if (props.onError) {
            props.onError(error);
          } else {
            console.error('Suspense error:', error);
          }
        });
    },
    isPending: () => promises.size > 0
  };

  pushSuspense(suspenseContext);

  try {
    if (props.children) {
      const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
      
      childrenArray.forEach(child => {
        if (child != null && child !== false) {
          const normalized = normalizeChild(child as Child);
          container.appendChild(normalized);
        }
      });
    }
  } catch (error) {
    setState(() => {
      suspenseState.value = { status: 'error', error: error as Error };
    });
    if (props.onError) {
      props.onError(error as Error);
    }
  } finally {
    popSuspense();
  }

  if (promises.size === 0 && isInitialRender) {
    setState(() => {
      suspenseState.value = { status: 'resolved', error: null };
    });
  }
  isInitialRender = false;

  effect(() => {
    const { status, error } = suspenseState.value;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (status === 'pending') {
      const fallback = props.fallback !== undefined 
        ? normalizeChild(props.fallback)
        : createDefaultFallback();
      container.appendChild(fallback);
    } else if (status === 'error' && error) {
      const errorNode = createErrorFallback(error);
      container.appendChild(errorNode);
    } else if (status === 'resolved') {
      pushSuspense(suspenseContext);
      try {
        if (props.children) {
          const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
          
          childrenArray.forEach(child => {
            if (child != null && child !== false) {
              const normalized = normalizeChild(child as Child);
              if (!normalized.parentNode) {
                container.appendChild(normalized);
              }
            }
          });
        }
      } finally {
        popSuspense();
      }
    }
  });

  return container;
}

function createDefaultFallback(): Node {
  const fallback = document.createElement('div');
  fallback.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 20px;';
  
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);
  
  fallback.appendChild(spinner);
  return fallback;
}

function createErrorFallback(error: Error): Node {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; margin: 20px 0; background: #fee; border: 2px solid #fcc; border-radius: 8px;';
  
  const title = document.createElement('h3');
  title.textContent = '⚠️ Failed to load';
  title.style.cssText = 'margin: 0 0 10px 0; color: #c00;';
  
  const message = document.createElement('p');
  message.textContent = error.message;
  message.style.cssText = 'margin: 0; color: #666;';
  
  container.appendChild(title);
  container.appendChild(message);
  
  return container;
}

export function lazy<P = {}>(
  loader: () => Promise<{ default: (props: P) => Node }>
): (props: P) => Node {
  let Component: ((props: P) => Node) | null = null;
  let loadingPromise: Promise<void> | null = null;
  let loadError: Error | null = null;

  return (props: P): Node => {
    const suspense = getCurrentSuspense();

    if (loadError) {
      throw loadError;
    }

    if (Component) {
      return Component(props);
    }

    if (!loadingPromise) {
      loadingPromise = loader()
        .then((module) => {
          Component = module.default;
          loadError = null;
        })
        .catch((error) => {
          loadError = error;
          throw error;
        });

      if (suspense) {
        suspense.addPromise(loadingPromise);
      }
    }

    if (suspense) {
      suspense.addPromise(loadingPromise);
    }

    const placeholder = document.createComment('lazy-loading');
    
    loadingPromise.then(() => {
      if (Component && placeholder.parentNode) {
        const rendered = Component(props);
        placeholder.parentNode.replaceChild(rendered, placeholder);
      }
    });

    return placeholder;
  };
}

export function createResource<T>(
  fetcher: () => Promise<T>
): () => T | undefined {
  let data: T | undefined = undefined;
  let error: Error | undefined = undefined;
  let promise: Promise<T> | null = null;

  return (): T | undefined => {
    const suspense = getCurrentSuspense();

    if (error) {
      throw error;
    }

    if (data !== undefined) {
      return data;
    }

    if (!promise) {
      promise = fetcher()
        .then((result) => {
          data = result;
          error = undefined;
          return result;
        })
        .catch((err) => {
          error = err;
          throw err;
        });

      if (suspense) {
        suspense.addPromise(promise);
      }
    }

    if (suspense && promise) {
      suspense.addPromise(promise);
    }

    return undefined;
  };
}

export function useSuspensePromise<T>(promise: Promise<T>): void {
  const suspense = getCurrentSuspense();
  
  if (suspense) {
    suspense.addPromise(promise);
  }
}

export function SuspenseList(props: {
  children?: any;
  revealOrder?: 'forwards' | 'backwards' | 'together';
  tail?: 'collapsed' | 'hidden';
}): Node {
  const container = document.createElement('div');
  container.setAttribute('data-suspense-list', 'true');

  if (props.children) {
    const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
    
    childrenArray.forEach((child, index) => {
      if (child != null && child !== false) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-suspense-list-item', String(index));
        
        const normalized = normalizeChild(child as Child);
        wrapper.appendChild(normalized);
        container.appendChild(wrapper);
      }
    });
  }

  return container;
}

