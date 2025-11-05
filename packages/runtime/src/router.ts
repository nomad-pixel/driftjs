import { state, setState, effect } from './reactivity';
import { jsx, cleanupComponentEffectsInNode } from './jsx-runtime';
import type { Component } from './jsx-runtime';

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
  path: () => string;
  context: () => RouteContext;
}


export function createRouter(config: RouterConfig) {
  const { mode = 'hash', routes, beforeEnter, beforeEach, afterEach } = config;
  
  const getPath = () => {
    if (mode === 'history') {
      return location.pathname + location.search;
    }
    return location.hash.slice(1) || '/';
  };
  
  let pathState = state(getPath());
  let contextState = state<RouteContext>({
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

  
  function findRoute(currentPath: string): { component: Component<any> | undefined; params: Record<string, string>; path: string } {
    const pathWithoutQuery = currentPath.split('?')[0];
    
    
    if (routes[pathWithoutQuery]) {
      return { component: routes[pathWithoutQuery], params: {}, path: pathWithoutQuery };
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
            return { component, params: parseParams(routePath, pathWithoutQuery), path: pathWithoutQuery };
          }
        }
      }
    }
    
    return { component: routes['*'], params: {}, path: pathWithoutQuery };
  }

  
  async function navigate(to: string, from: string = pathState.value) {
    
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
    
    setState(() => {
      pathState.value = to;
      contextState.value = newContext;
    });
    
    
    afterEach?.(to, from);
    
    return true;
  }

  
  if (mode === 'history') {
    window.addEventListener('popstate', () => {
      const newPath = getPath();
      setState(() => {
        pathState.value = newPath;
        contextState.value = {
          path: newPath,
          params: findRoute(newPath).params,
          query: parseQuery(newPath.split('?')[1] || '')
        };
      });
    });
  } else {
    window.addEventListener('hashchange', () => {
      const newPath = getPath();
      setState(() => {
        pathState.value = newPath;
        contextState.value = {
          path: newPath,
          params: findRoute(newPath).params,
          query: parseQuery(newPath.split('?')[1] || '')
        };
      });
    });
  }

  let routerViewNode: Node | null = null;
  
  effect(() => {
    const currentPath = pathState.value;
    const { component, params, path } = findRoute(currentPath);
    const next = component ? jsx(component, { ...contextState.value, params }, path) : document.createTextNode('Not Found');
    
    if (routerViewNode && routerViewNode.parentNode && routerViewNode !== next) {
      cleanupComponentEffectsInNode(routerViewNode);
      routerViewNode.parentNode.replaceChild(next, routerViewNode);
      routerViewNode = next;
    } else if (!routerViewNode) {
      routerViewNode = next;
    }
  });

  const RouterView: Component = () => {
    if (!routerViewNode) {
      const { component, params, path } = findRoute(pathState.value);
      routerViewNode = component ? jsx(component, { ...contextState.value, params }, path) : document.createTextNode('Not Found');
    }
    return routerViewNode;
  };

  const push = (p: string) => navigate(p);
  const replace = (p: string) => {
    if (mode === 'history') {
      history.replaceState(null, '', p);
    } else {
      location.hash = p;
    }
    setState(() => {
      pathState.value = p;
      contextState.value = {
        path: p,
        params: findRoute(p).params,
        query: parseQuery(p.split('?')[1] || '')
      };
    });
  };

  return { 
    RouterView, 
    push, 
    replace, 
    path: () => pathState.value, 
    context: () => contextState.value 
  };
}


export function createHashRouter(map: RouteMap) {
  return createRouter({ routes: map, mode: 'hash' });
}
