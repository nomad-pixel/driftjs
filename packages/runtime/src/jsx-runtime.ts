import { normalizeChild, setProp, Child } from './dom';
import { effect } from './reactivity';

export type Component<P = {}> = (props: P & { children?: any; key?: any }) => Node;


const componentCache = new Map<string, { node: Node; props: any }>();

export const Fragment = (props: { children?: any; key?: any }) => {
  const frag = document.createDocumentFragment();
  appendChildren(frag, props.children);
  return frag;
};

function appendChildren(parent: Node, children: any) {
  if (children == null) return;
  if (Array.isArray(children)) { 
    children.forEach(c => parent.appendChild(normalizeChild(c as Child))); 
  } else { 
    parent.appendChild(normalizeChild(children as Child)); 
  }
}


function createElementWithKey(type: string, props: Record<string, any>, key?: any): Node {
  const cacheKey = key ? `${type}:${key}` : null;
  
  
  if (cacheKey && componentCache.has(cacheKey)) {
    const cached = componentCache.get(cacheKey)!;
    
    if (cached.props !== props) {
      updateElementProps(cached.node as Element, props);
      cached.props = props;
    }
    return cached.node.cloneNode(true);
  }
  
  const el = document.createElement(type);
  updateElementProps(el, props);
  appendChildren(el, props.children);
  
  
  if (cacheKey) {
    componentCache.set(cacheKey, { node: el.cloneNode(true), props });
  }
  
  return el;
}

function updateElementProps(el: Element, props: Record<string, any>) {
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children' || k === 'key') continue;
    
    if (typeof v === 'function' && !/^on[A-Z]/.test(k)) {
      
      effect(() => setProp(el, k, (v as Function)()));
    } else {
      setProp(el, k, v);
    }
  }
}

export function jsx(type: any, props: Record<string, any>, key?: any): Node {
  props ||= {};
  
  if (typeof type === 'function') {
    
    if (key) {
      const cacheKey = `${type.name || 'Component'}:${key}`;
      if (componentCache.has(cacheKey)) {
        const cached = componentCache.get(cacheKey)!;
        if (cached.props !== props) {
          cached.props = props;
          return (type as Component<any>)(props);
        }
        return cached.node.cloneNode(true);
      }
      const node = (type as Component<any>)(props);
      componentCache.set(cacheKey, { node: node.cloneNode(true), props });
      return node;
    }
    return (type as Component<any>)(props);
  }
  
  return createElementWithKey(type, props, key);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

declare global {
  namespace JSX {
    interface ElementChildrenAttribute { children: {}; }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
export type { Component as FC };
