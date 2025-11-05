import { state, effect, setState } from './reactivity';
import { getComponentInstanceKey } from './reactivity';

export interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryProps {
  children?: any;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => Node;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<() => any>;
}

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

interface ErrorBoundaryHandler {
  catchError: (error: Error, context?: string) => void;
  name: string;
}

const errorBoundaryStack: ErrorBoundaryHandler[] = [];

function pushErrorBoundary(handler: ErrorBoundaryHandler) {
  errorBoundaryStack.push(handler);
}

function popErrorBoundary() {
  errorBoundaryStack.pop();
}

export function getCurrentErrorBoundary(): ErrorBoundaryHandler | null {
  return errorBoundaryStack[errorBoundaryStack.length - 1] || null;
}

export function captureError(error: Error, context?: string) {
  const currentBoundary = getCurrentErrorBoundary();
  if (currentBoundary) {
    currentBoundary.catchError(error, context);
  } else {
    console.error('Uncaught error (no error boundary):', error);
    throw error;
  }
}

export function useErrorHandler() {
  return (error: Error, context?: string) => {
    captureError(error, context);
  };
}

function createDefaultFallback(error: Error, errorInfo: ErrorInfo, reset: () => void): Node {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; margin: 20px 0; background: #fee; border: 2px solid #fcc; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;';
  
  const title = document.createElement('h3');
  title.textContent = '⚠️ Something went wrong';
  title.style.cssText = 'margin: 0 0 10px 0; color: #c00;';
  
  const message = document.createElement('p');
  message.textContent = error.message;
  message.style.cssText = 'margin: 0 0 10px 0; color: #666;';
  
  const stack = document.createElement('details');
  stack.style.cssText = 'margin: 10px 0; padding: 10px; background: #fff; border-radius: 4px;';
  
  const summary = document.createElement('summary');
  summary.textContent = 'Error details';
  summary.style.cssText = 'cursor: pointer; font-weight: 600; color: #c00;';
  
  const stackTrace = document.createElement('pre');
  stackTrace.textContent = error.stack || 'No stack trace available';
  stackTrace.style.cssText = 'margin: 10px 0 0 0; padding: 10px; background: #f5f5f5; border-radius: 4px; overflow: auto; font-size: 12px;';
  
  stack.appendChild(summary);
  stack.appendChild(stackTrace);
  
  const button = document.createElement('button');
  button.textContent = 'Try again';
  button.style.cssText = 'padding: 8px 16px; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
  button.onmouseover = () => { button.style.background = '#a00'; };
  button.onmouseout = () => { button.style.background = '#c00'; };
  button.onclick = reset;
  
  container.appendChild(title);
  container.appendChild(message);
  container.appendChild(stack);
  container.appendChild(button);
  
  return container;
}

export function ErrorBoundary(props: ErrorBoundaryProps): Node {
  const instanceKey = getComponentInstanceKey() || 'ErrorBoundary';
  
  const errorState = state<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null
  });
  
  const container = document.createElement('div');
  container.setAttribute('data-error-boundary', instanceKey);
  
  const reset = () => {
    setState(() => {
      errorState.value = {
        hasError: false,
        error: null,
        errorInfo: null
      };
    });
    
    if (props.onReset) {
      props.onReset();
    }
  };
  
  const handleError = (error: Error, context?: string) => {
    const errorInfo: ErrorInfo = {
      componentStack: context,
      errorBoundary: instanceKey
    };
    
    setState(() => {
      errorState.value = {
        hasError: true,
        error,
        errorInfo
      };
    });
    
    if (props.onError) {
      props.onError(error, errorInfo);
    }
  };
  
  const errorBoundaryHandler: ErrorBoundaryHandler = {
    catchError: handleError,
    name: instanceKey
  };
  
  pushErrorBoundary(errorBoundaryHandler);
  
  const initialChildren = props.children;
  
  try {
    if (initialChildren) {
      if (Array.isArray(initialChildren)) {
        initialChildren.forEach(child => {
          if (child instanceof Node) {
            container.appendChild(child);
          } else if (child != null && child !== false) {
            container.appendChild(document.createTextNode(String(child)));
          }
        });
      } else if (initialChildren instanceof Node) {
        container.appendChild(initialChildren);
      } else if (initialChildren != null && initialChildren !== false) {
        container.appendChild(document.createTextNode(String(initialChildren)));
      }
    }
  } catch (error) {
    handleError(error as Error, 'ErrorBoundary initial render');
  }
  
  effect(() => {
    return () => {
      popErrorBoundary();
    };
  });
  
  if (props.resetKeys && props.resetKeys.length > 0) {
    const previousKeys = props.resetKeys.map(fn => fn());
    
    effect(() => {
      const currentKeys = props.resetKeys!.map(fn => fn());
      
      const hasChanged = currentKeys.some((key, index) => key !== previousKeys[index]);
      
      if (hasChanged && errorState.value.hasError) {
        reset();
        previousKeys.length = 0;
        previousKeys.push(...currentKeys);
      }
    });
  }
  
  effect(() => {
    if (errorState.value.hasError && errorState.value.error && errorState.value.errorInfo) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      const fallbackNode = props.fallback
        ? props.fallback(errorState.value.error, errorState.value.errorInfo, reset)
        : createDefaultFallback(errorState.value.error, errorState.value.errorInfo, reset);
      
      container.appendChild(fallbackNode);
    } else if (errorState.value.hasError === false && container.childNodes.length === 0) {
      try {
        if (initialChildren) {
          if (Array.isArray(initialChildren)) {
            initialChildren.forEach(child => {
              if (child instanceof Node && !child.parentNode) {
                container.appendChild(child);
              } else if (child instanceof Node) {
                container.appendChild(child.cloneNode(true));
              } else if (child != null && child !== false) {
                container.appendChild(document.createTextNode(String(child)));
              }
            });
          } else if (initialChildren instanceof Node && !initialChildren.parentNode) {
            container.appendChild(initialChildren);
          } else if (initialChildren instanceof Node) {
            container.appendChild(initialChildren.cloneNode(true));
          } else if (initialChildren != null && initialChildren !== false) {
            container.appendChild(document.createTextNode(String(initialChildren)));
          }
        }
      } catch (error) {
        handleError(error as Error, 'ErrorBoundary render after reset');
      }
    }
  });
  
  return container;
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const currentBoundary = getCurrentErrorBoundary();
    if (currentBoundary) {
      event.preventDefault();
      captureError(event.error || new Error(event.message), `at ${event.filename}:${event.lineno}:${event.colno}`);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    const currentBoundary = getCurrentErrorBoundary();
    if (currentBoundary) {
      event.preventDefault();
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      captureError(error, 'unhandled promise rejection');
    }
  });
}
