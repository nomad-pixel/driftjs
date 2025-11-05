import { state, setState, effect } from './reactivity';
import type { FC } from './jsx-runtime';

export interface ErrorInfo {
  componentStack?: string;
  error: Error;
  timestamp: Date;
}

export interface ErrorBoundaryProps {
  fallback?: ((error: Error, errorInfo: ErrorInfo, reset: () => void) => Node) | Node;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  children: any;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ERROR_BOUNDARY_CONTEXTS = new WeakMap<Node, ErrorBoundaryContext>();

interface ErrorBoundaryContext {
  catchError: (error: Error, componentStack?: string) => void;
  reset: () => void;
}

export function getErrorBoundaryContext(node: Node): ErrorBoundaryContext | null {
  let current: Node | null = node;
  while (current) {
    const context = ERROR_BOUNDARY_CONTEXTS.get(current);
    if (context) return context;
    current = current.parentNode;
  }
  return null;
}

let CURRENT_ERROR_BOUNDARY: ErrorBoundaryContext | null = null;

export function setCurrentErrorBoundary(context: ErrorBoundaryContext | null) {
  CURRENT_ERROR_BOUNDARY = context;
}

export function getCurrentErrorBoundary(): ErrorBoundaryContext | null {
  return CURRENT_ERROR_BOUNDARY;
}

export const ErrorBoundary: FC<ErrorBoundaryProps> = (props) => {
  const errorState = state<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  let contentNode: Node | null = null;
  let fallbackNode: Node | null = null;
  const container = document.createElement('div');
  container.setAttribute('data-error-boundary', 'true');

  const reset = () => {
    setState(() => {
      errorState.value = {
        hasError: false,
        error: null,
        errorInfo: null
      };
    });
    
    props.onReset?.();
    
    if (fallbackNode && fallbackNode.parentNode === container) {
      container.removeChild(fallbackNode);
      fallbackNode = null;
    }
    
    if (contentNode) {
      container.appendChild(contentNode);
    }
  };

  const catchError = (error: Error, componentStack?: string) => {
    const errorInfo: ErrorInfo = {
      error,
      componentStack,
      timestamp: new Date()
    };

    setState(() => {
      errorState.value = {
        hasError: true,
        error,
        errorInfo
      };
    });

    props.onError?.(error, errorInfo);

    console.error('[ErrorBoundary] Caught error:', error);
    if (componentStack) {
      console.error('[ErrorBoundary] Component stack:', componentStack);
    }
  };

  const context: ErrorBoundaryContext = {
    catchError,
    reset
  };

  ERROR_BOUNDARY_CONTEXTS.set(container, context);

  if (props.resetKeys && props.resetKeys.length > 0) {
    let prevKeys = [...props.resetKeys];
    effect(() => {
      const currentKeys = props.resetKeys || [];
      const keysChanged = prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, i) => !Object.is(key, currentKeys[i]));
      
      if (keysChanged && errorState.value.hasError) {
        reset();
      }
      prevKeys = [...currentKeys];
    });
  }

  effect(() => {
    if (errorState.value.hasError) {
      if (contentNode && contentNode.parentNode === container) {
        container.removeChild(contentNode);
      }

      const error = errorState.value.error!;
      const errorInfo = errorState.value.errorInfo!;

      if (typeof props.fallback === 'function') {
        fallbackNode = props.fallback(error, errorInfo, reset);
      } else if (props.fallback) {
        fallbackNode = props.fallback;
      } else {
        fallbackNode = createDefaultFallback(error, errorInfo, reset);
      }

      container.appendChild(fallbackNode);
    } else {
      if (fallbackNode && fallbackNode.parentNode === container) {
        container.removeChild(fallbackNode);
        fallbackNode = null;
      }

      const prevBoundary = CURRENT_ERROR_BOUNDARY;
      CURRENT_ERROR_BOUNDARY = context;

      try {
        const children = typeof props.children === 'function' 
          ? props.children() 
          : props.children;

        if (children instanceof Node) {
          contentNode = children;
        } else if (Array.isArray(children)) {
          const fragment = document.createDocumentFragment();
          children.forEach(child => {
            if (child instanceof Node) {
              fragment.appendChild(child);
            } else if (child != null && child !== false) {
              fragment.appendChild(document.createTextNode(String(child)));
            }
          });
          contentNode = fragment;
        } else if (children != null && children !== false) {
          contentNode = document.createTextNode(String(children));
        } else {
          contentNode = document.createTextNode('');
        }

        if (contentNode && !contentNode.parentNode) {
          container.appendChild(contentNode);
        }
      } catch (error) {
        catchError(error as Error, 'Error rendering children');
      } finally {
        CURRENT_ERROR_BOUNDARY = prevBoundary;
      }
    }
  });

  return container;
};

function createDefaultFallback(error: Error, errorInfo: ErrorInfo, reset: () => void): Node {
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 20px;
    margin: 20px;
    border: 2px solid #ef4444;
    border-radius: 8px;
    background: #fee;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const title = document.createElement('h2');
  title.textContent = '⚠️ Something went wrong';
  title.style.cssText = 'margin: 0 0 12px 0; color: #dc2626; font-size: 20px;';

  const message = document.createElement('p');
  message.textContent = error.message;
  message.style.cssText = 'margin: 0 0 12px 0; color: #991b1b; font-size: 14px;';

  const details = document.createElement('details');
  details.style.cssText = 'margin: 12px 0; color: #7f1d1d; font-size: 12px;';

  const summary = document.createElement('summary');
  summary.textContent = 'Error details';
  summary.style.cssText = 'cursor: pointer; font-weight: 600; margin-bottom: 8px;';

  const stack = document.createElement('pre');
  stack.textContent = error.stack || 'No stack trace available';
  stack.style.cssText = `
    margin: 8px 0;
    padding: 12px;
    background: #fff;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 11px;
    line-height: 1.5;
  `;

  details.appendChild(summary);
  details.appendChild(stack);

  if (errorInfo.componentStack) {
    const componentStack = document.createElement('pre');
    componentStack.textContent = errorInfo.componentStack;
    componentStack.style.cssText = stack.style.cssText;
    
    const componentLabel = document.createElement('div');
    componentLabel.textContent = 'Component Stack:';
    componentLabel.style.cssText = 'font-weight: 600; margin-top: 8px;';
    
    details.appendChild(componentLabel);
    details.appendChild(componentStack);
  }

  const resetButton = document.createElement('button');
  resetButton.textContent = '🔄 Try Again';
  resetButton.style.cssText = `
    padding: 8px 16px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  `;
  resetButton.onmouseover = () => {
    resetButton.style.background = '#b91c1c';
  };
  resetButton.onmouseout = () => {
    resetButton.style.background = '#dc2626';
  };
  resetButton.onclick = () => reset();

  container.appendChild(title);
  container.appendChild(message);
  container.appendChild(details);
  container.appendChild(resetButton);

  return container;
}

export function wrapWithErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  componentName?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          const boundary = getCurrentErrorBoundary();
          if (boundary) {
            boundary.catchError(error, componentName ? `in ${componentName}` : undefined);
          } else {
            console.error('Uncaught error (no error boundary):', error);
            throw error;
          }
        });
      }
      
      return result;
    } catch (error) {
      const boundary = getCurrentErrorBoundary();
      if (boundary) {
        boundary.catchError(error as Error, componentName ? `in ${componentName}` : undefined);
        return null;
      } else {
        throw error;
      }
    }
  }) as T;
}

export function useErrorHandler() {
  return (error: Error, componentStack?: string) => {
    const boundary = getCurrentErrorBoundary();
    if (boundary) {
      boundary.catchError(error, componentStack);
    } else {
      console.error('No error boundary found');
      throw error;
    }
  };
}

export function captureError(error: Error, componentStack?: string): void {
  const boundary = getCurrentErrorBoundary();
  if (boundary) {
    boundary.catchError(error, componentStack);
  } else {
    console.error('[ErrorBoundary] No error boundary found, rethrowing error');
    throw error;
  }
}

