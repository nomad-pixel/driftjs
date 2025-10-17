import { createSignal, effect } from './reactivity';
import type { Component } from './jsx-runtime';
import type { Signal } from './types';

type RouteMap = Record<string, Component<any> | undefined>;
type RouteGuard = (to: string, from: string) => boolean | string | Promise<boolean | string>;
type RouterMode = 'hash' | 'history';

export interface RouterConfig {
  mode?: RouterMode;
  routes: RouteMap;
  beforeEnter?: RouteGuard;
  beforeEach?: RouteGuard;
  afterEach?: (to: string, from: string) => void;
}

export interface RouteContext {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface Router {
  RouterView: Component;
  push: (path: string) => Promise<boolean>;
  replace: (path: string) => void;
  path: Signal<string>;
  context: Signal<RouteContext>;
}


export function createRouter(config: RouterConfig) {
  const { mode = 'hash', routes, beforeEnter, beforeEach, afterEach } = config;
  
  const getPath = () => {
    if (mode === 'history') {
      return location.pathname + location.search;
    }
    return location.hash.slice(1) || '/';
  };
  
  const [path, setPath] = createSignal(getPath());
  const [context, setContext] = createSignal<RouteContext>({
    path: getPath(),
    params: {},
    query: {}
  });

  
  function parseQuery(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  
  function parseParams(routePath: string, currentPath: string): Record<string, string> {
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');
    const params: Record<string, string> = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      
      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        params[paramName] = pathPart || '';
      }
    }
    
    return params;
  }

  
  function findRoute(currentPath: string): { component: Component<any> | undefined; params: Record<string, string> } {
    const pathWithoutQuery = currentPath.split('?')[0];
    
    
    if (routes[pathWithoutQuery]) {
      return { component: routes[pathWithoutQuery], params: {} };
    }
    
    
    for (const [routePath, component] of Object.entries(routes)) {
      if (routePath.includes(':')) {
        const routeParts = routePath.split('/');
        const pathParts = pathWithoutQuery.split('/');
        
        if (routeParts.length === pathParts.length) {
          let matches = true;
          for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];
            
            if (!routePart.startsWith(':') && routePart !== pathPart) {
              matches = false;
              break;
            }
          }
          
          if (matches) {
            return { component, params: parseParams(routePath, pathWithoutQuery) };
          }
        }
      }
    }
    
    return { component: routes['*'], params: {} };
  }

  
  async function navigate(to: string, from: string = path()) {
    
    if (beforeEach) {
      const result = await beforeEach(to, from);
      if (result === false) return false;
      if (typeof result === 'string') to = result;
    }
    
    
    const { component } = findRoute(to);
    if (beforeEnter && component) {
      const result = await beforeEnter(to, from);
      if (result === false) return false;
      if (typeof result === 'string') to = result;
    }
    
    
    if (mode === 'history') {
      history.pushState(null, '', to);
    } else {
      location.hash = to;
    }
    
    const newContext: RouteContext = {
      path: to,
      params: findRoute(to).params,
      query: parseQuery(to.split('?')[1] || '')
    };
    
    setPath(to);
    setContext(newContext);
    
    
    afterEach?.(to, from);
    
    return true;
  }

  
  if (mode === 'history') {
    window.addEventListener('popstate', () => {
      const newPath = getPath();
      setPath(newPath);
      setContext({
        path: newPath,
        params: findRoute(newPath).params,
        query: parseQuery(newPath.split('?')[1] || '')
      });
    });
  } else {
    window.addEventListener('hashchange', () => {
      const newPath = getPath();
      setPath(newPath);
      setContext({
        path: newPath,
        params: findRoute(newPath).params,
        query: parseQuery(newPath.split('?')[1] || '')
      });
    });
  }

  const RouterView: Component = () => {
    let node: Node = document.createComment('router-view');
    effect(() => {
      const { component, params } = findRoute(path());
      const next = component ? component({ ...context(), params }) : document.createTextNode('Not Found');
      node.parentNode?.replaceChild(next, node);
      node = next;
    });
    return node;
  };

  const push = (p: string) => navigate(p);
  const replace = (p: string) => {
    if (mode === 'history') {
      history.replaceState(null, '', p);
    } else {
      location.hash = p;
    }
    setPath(p);
    setContext({
      path: p,
      params: findRoute(p).params,
      query: parseQuery(p.split('?')[1] || '')
    });
  };

  return { RouterView, push, replace, path, context };
}


export function createHashRouter(map: RouteMap) {
  return createRouter({ routes: map, mode: 'hash' });
}
