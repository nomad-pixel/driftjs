export { 
  computed, 
  effect,
  batch,
  state,
  setState,
  untrack,
  EffectPriority,
  trackComponentEffect,
  cleanupComponentEffects,
  type EffectOptions
} from './reactivity';

export { 
  jsx, 
  jsxs, 
  jsxDEV, 
  Fragment, 
  type FC, 
  type Component 
} from './jsx-runtime';

import type { Component } from './jsx-runtime';

export { 
  createRouter, 
  createHashRouter,
  type Router,
  type RouterConfig,
  type RouteContext
} from './router';

export {
  createContext,
  provide as provideContext,
  inject as injectContext,
  createProvider,
  hasContext,
  cleanupContext,
  type Context
} from './context';

export {
  provide,
  inject,
  injectAll,
  createModule,
  provideModule,
  Injectable,
  hasService,
  clearAllServices,
  cleanupScopedServices,
  getAllServices,
  type ServiceScope,
  type ServiceOptions,
  type ServiceClass,
  type Module
} from './di';

export {
  memo,
  VirtualList,
  lazy,
  debounce,
  throttle,
  useIntersectionObserver,
  measurePerformance,
  clearCaches
} from './performance';

export {
  ErrorBoundary,
  useErrorHandler,
  captureError,
  type ErrorInfo,
  type ErrorBoundaryProps
} from './error-boundary';

export { devtools } from './devtools';

export type {
  Signal,
  Setter,
  SignalTuple,
  EffectFn,
  EffectCleanup,
  ComputedFn,
  Computed,
  ComponentProps,
  Child,
  RouteMap,
  RouteGuard,
  RouterMode,
  VirtualListProps,
  IntersectionObserverHook,
  SignalInfo,
  EffectInfo,
  DevToolsStats,
  AllHTMLAttributes,
  AnchorAttributes,
  ImageAttributes,
  InputAttributes,
  TextareaAttributes,
  SelectAttributes
} from './types';

export { 
  normalizeChild, 
  setProp, 
  isNode 
} from './dom';

export function render(node: Node, container: Element) {
  container.replaceChildren(node);
}

export function createApp(rootComponent: Component) {
  return {
    mount(selector: string | Element) {
      const container = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;
      
      if (!container) {
        throw new Error(`Container not found: ${selector}`);
      }
      
      const app = rootComponent({});
      render(app, container);
      
      return {
        unmount() {
          container.innerHTML = '';
        }
      };
    }
  };
}
