import { state, setState, effect } from './reactivity';
import { jsx, cleanupComponentEffectsInNode } from './jsx-runtime';
import type { Component } from './jsx-runtime';

export type LazyComponent<P = any> = () => Promise<{ default: Component<P> }>;
export type RouteComponent<P = any> = Component<P> | LazyComponent<P>;

export interface RouteMetadata {
  title?: string;
  description?: string;
  meta?: Record<string, string>;
  breadcrumb?: string | ((params: Record<string, string>) => string);
}

export interface RouteConfig {
  component: RouteComponent;
  meta?: RouteMetadata;
  beforeEnter?: RouteGuard;
}

type RouteMap = Record<string, RouteComponent | RouteConfig | undefined>;
type RouteGuard = (to: string, from: string) => boolean | string | Promise<boolean | string>;
type RouterMode = 'hash' | 'history';

export interface TransitionConfig {
  name?: string;
  duration?: number;
  enterClass?: string;
  leaveClass?: string;
  onEnter?: (el: Element) => void;
  onLeave?: (el: Element) => void;
}

export interface ScrollBehavior {
  x?: number;
  y?: number;
  behavior?: 'auto' | 'smooth';
}

export interface RouterConfig {
  mode?: RouterMode;
  routes: RouteMap;
  beforeEnter?: RouteGuard;
  beforeEach?: RouteGuard;
  afterEach?: (to: string, from: string) => void;
  scrollBehavior?: 'auto' | 'manual' | ((to: string, from: string, savedPosition?: ScrollBehavior) => ScrollBehavior);
  transition?: TransitionConfig;
}

export interface RouteContext {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  meta: RouteMetadata;
}

export interface Breadcrumb {
  path: string;
  label: string;
}

export interface Router {
  RouterView: Component;
  push: (path: string) => Promise<boolean>;
  replace: (path: string) => void;
  path: () => string;
  context: () => RouteContext;
  breadcrumbs: () => Breadcrumb[];
}


export function createRouter(config: RouterConfig) {
  const { 
    mode = 'hash', 
    routes, 
    beforeEnter, 
    beforeEach, 
    afterEach,
    scrollBehavior = 'auto',
    transition
  } = config;
  
  const scrollPositions = new Map<string, ScrollBehavior>();
  const loadedComponents = new Map<string, Component>();
  
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
    query: {},
    meta: {}
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

  
  function normalizeRoute(route: RouteComponent | RouteConfig | undefined): RouteConfig | undefined {
    if (!route) return undefined;
    
    if (typeof route === 'object' && 'component' in route) {
      return route as RouteConfig;
    }
    
    if (typeof route === 'function') {
      return { component: route as RouteComponent, meta: {} };
    }
    
    return undefined;
  }
  
  async function resolveComponent(routeConfig: RouteConfig): Promise<Component> {
    const { component } = routeConfig;
    const componentString = component.toString();
    const cacheKey = componentString;
    
    if (loadedComponents.has(cacheKey)) {
      return loadedComponents.get(cacheKey)!;
    }
    
    const isLazy = componentString.includes('import(');
    
    if (isLazy && typeof component === 'function') {
      try {
        const result = (component as LazyComponent)();
        const module = await result;
        
        if (module && module.default) {
          const resolved = module.default;
          loadedComponents.set(cacheKey, resolved);
          return resolved;
        }
      } catch (e) {
        console.error('Failed to load lazy component:', e);
        throw e;
      }
    }
    
    return component as Component;
  }
  
  function findRoute(currentPath: string): { 
    routeConfig: RouteConfig | undefined; 
    params: Record<string, string>; 
    path: string;
    matchedPath: string;
  } {
    const pathWithoutQuery = currentPath.split('?')[0];
    
    if (routes[pathWithoutQuery]) {
      return { 
        routeConfig: normalizeRoute(routes[pathWithoutQuery]), 
        params: {}, 
        path: pathWithoutQuery,
        matchedPath: pathWithoutQuery
      };
    }
    
    for (const [routePath, route] of Object.entries(routes)) {
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
            return { 
              routeConfig: normalizeRoute(route), 
              params: parseParams(routePath, pathWithoutQuery), 
              path: pathWithoutQuery,
              matchedPath: routePath
            };
          }
        }
      }
    }
    
    return { 
      routeConfig: normalizeRoute(routes['*']), 
      params: {}, 
      path: pathWithoutQuery,
      matchedPath: '*'
    };
  }

  
  function applyMetadata(meta: RouteMetadata) {
    if (meta.title) {
      document.title = meta.title;
    }
    
    if (meta.description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', meta.description);
    }
    
    if (meta.meta) {
      Object.entries(meta.meta).forEach(([name, content]) => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      });
    }
  }
  
  function saveScrollPosition(path: string) {
    scrollPositions.set(path, {
      x: window.scrollX,
      y: window.scrollY
    });
  }
  
  function restoreScrollPosition(to: string, from: string) {
    if (scrollBehavior === 'manual') {
      return;
    }
    
    if (typeof scrollBehavior === 'function') {
      const savedPosition = scrollPositions.get(to);
      const position = scrollBehavior(to, from, savedPosition);
      window.scrollTo(position.x || 0, position.y || 0);
      return;
    }
    
    const savedPosition = scrollPositions.get(to);
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(savedPosition.x || 0, savedPosition.y || 0);
      }, 0);
    } else {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  }
  
  function generateBreadcrumbs(path: string, params: Record<string, string>): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const parts = path.split('/').filter(Boolean);
    let currentPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      currentPath += '/' + parts[i];
      const { routeConfig, matchedPath } = findRoute(currentPath);
      
      if (routeConfig?.meta?.breadcrumb) {
        const breadcrumb = routeConfig.meta.breadcrumb;
        const label = typeof breadcrumb === 'function' 
          ? breadcrumb(params) 
          : breadcrumb;
        
        breadcrumbs.push({
          path: currentPath,
          label
        });
      } else {
        breadcrumbs.push({
          path: currentPath,
          label: parts[i].charAt(0).toUpperCase() + parts[i].slice(1)
        });
      }
    }
    
    return breadcrumbs;
  }
  
  async function applyTransition(
    oldNode: Node | null, 
    newNode: Node,
    container: Node | null
  ): Promise<void> {
    if (!transition || !container) {
      return;
    }
    
    const { duration = 300, enterClass, leaveClass, onEnter, onLeave } = transition;
    
    if (oldNode && leaveClass && oldNode instanceof Element) {
      onLeave?.(oldNode);
      oldNode.classList.add(leaveClass);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      if (oldNode.parentNode) {
        oldNode.parentNode.removeChild(oldNode);
      }
    } else if (oldNode && oldNode.parentNode) {
      oldNode.parentNode.removeChild(oldNode);
    }
    
    if (enterClass && newNode instanceof Element) {
      newNode.classList.add(enterClass);
      onEnter?.(newNode);
      
      setTimeout(() => {
        newNode.classList.remove(enterClass);
      }, duration);
    }
  }
  
  async function navigate(to: string, from: string = pathState.value) {
    if (beforeEach) {
      const result = await beforeEach(to, from);
      if (result === false) return false;
      if (typeof result === 'string') to = result;
    }
    
    const { routeConfig } = findRoute(to);
    const routeBeforeEnter = routeConfig?.beforeEnter;
    
    if (beforeEnter || routeBeforeEnter) {
      const guard = routeBeforeEnter || beforeEnter;
      const result = await guard!(to, from);
      if (result === false) return false;
      if (typeof result === 'string') to = result;
    }
    
    saveScrollPosition(from);
    
    if (mode === 'history') {
      history.pushState(null, '', to);
    } else {
      location.hash = to;
    }
    
    const { params, path } = findRoute(to);
    const meta = routeConfig?.meta || {};
    
    const newContext: RouteContext = {
      path: to,
      params,
      query: parseQuery(to.split('?')[1] || ''),
      meta
    };
    
    applyMetadata(meta);
    
    setState(() => {
      pathState.value = to;
      contextState.value = newContext;
    });
    
    restoreScrollPosition(to, from);
    
    afterEach?.(to, from);
    
    return true;
  }

  
  if (mode === 'history') {
    window.addEventListener('popstate', () => {
      const newPath = getPath();
      const { routeConfig, params } = findRoute(newPath);
      const meta = routeConfig?.meta || {};
      
      applyMetadata(meta);
      
      setState(() => {
        pathState.value = newPath;
        contextState.value = {
          path: newPath,
          params,
          query: parseQuery(newPath.split('?')[1] || ''),
          meta
        };
      });
    });
  } else {
    window.addEventListener('hashchange', () => {
      const newPath = getPath();
      const { routeConfig, params } = findRoute(newPath);
      const meta = routeConfig?.meta || {};
      
      applyMetadata(meta);
      
      setState(() => {
        pathState.value = newPath;
        contextState.value = {
          path: newPath,
          params,
          query: parseQuery(newPath.split('?')[1] || ''),
          meta
        };
      });
    });
  }

  let viewContainer: HTMLElement | null = null;
  let currentPath: string | null = null;
  let isUpdating = false;
  
  async function updateView(path: string, container: HTMLElement) {
    if (currentPath === path || isUpdating) {
      return;
    }
    
    isUpdating = true;
    
    try {
      const { routeConfig, params } = findRoute(path);
      
      let component: Component | undefined;
      
      if (routeConfig) {
        component = await resolveComponent(routeConfig);
      }
      
      const next = component 
        ? jsx(component, { ...contextState.value, params }, path) 
        : document.createTextNode('Not Found');
      
      const oldChild = container.firstChild;
      
      if (oldChild) {
        cleanupComponentEffectsInNode(oldChild);
        
        if (transition) {
          await applyTransition(oldChild, next, container);
        }
      }
      
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      container.appendChild(next);
      
      currentPath = path;
    } finally {
      isUpdating = false;
    }
  }
  
  effect(() => {
    if (viewContainer) {
      const path = pathState.value;
      updateView(path, viewContainer);
    }
  });

  const RouterView: Component = () => {
    if (!viewContainer) {
      viewContainer = document.createElement('div');
      viewContainer.setAttribute('data-router-view', 'true');
      
      const { routeConfig, params, path } = findRoute(pathState.value);
      
      if (routeConfig) {
        const component = routeConfig.component;
        const isLazy = typeof component === 'function' && component.toString().includes('import(');
        
        if (isLazy) {
          const loading = document.createComment('Loading...');
          viewContainer.appendChild(loading);
          
          resolveComponent(routeConfig).then(resolved => {
            if (viewContainer && loading.parentNode === viewContainer) {
              const node = jsx(resolved, { ...contextState.value, params }, path);
              while (viewContainer.firstChild) {
                viewContainer.removeChild(viewContainer.firstChild);
              }
              viewContainer.appendChild(node);
              currentPath = path;
            }
          }).catch(err => {
            console.error('Failed to load route:', err);
            if (viewContainer) {
              while (viewContainer.firstChild) {
                viewContainer.removeChild(viewContainer.firstChild);
              }
              const errorNode = document.createTextNode('Failed to load route');
              viewContainer.appendChild(errorNode);
            }
          });
        } else {
          const node = jsx(component as Component, { ...contextState.value, params }, path);
          viewContainer.appendChild(node);
          currentPath = path;
        }
      } else {
        const notFound = document.createTextNode('Not Found');
        viewContainer.appendChild(notFound);
        currentPath = path;
      }
    }
    return viewContainer;
  };

  const push = (p: string) => navigate(p);
  
  const replace = (p: string) => {
    const from = pathState.value;
    
    saveScrollPosition(from);
    
    if (mode === 'history') {
      history.replaceState(null, '', p);
    } else {
      location.hash = p;
    }
    
    const { routeConfig, params } = findRoute(p);
    const meta = routeConfig?.meta || {};
    
    applyMetadata(meta);
    
    setState(() => {
      pathState.value = p;
      contextState.value = {
        path: p,
        params,
        query: parseQuery(p.split('?')[1] || ''),
        meta
      };
    });
    
    restoreScrollPosition(p, from);
  };

  const breadcrumbs = () => {
    const { path, params } = contextState.value;
    return generateBreadcrumbs(path, params);
  };

  return { 
    RouterView, 
    push, 
    replace, 
    path: () => pathState.value, 
    context: () => contextState.value,
    breadcrumbs
  };
}


export function createHashRouter(map: RouteMap) {
  return createRouter({ routes: map, mode: 'hash' });
}
