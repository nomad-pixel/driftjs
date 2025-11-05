import { normalizeChild, setProp, Child } from './dom';
import { effect, setComponentContext, getComponentContext, getComponentEffectIndex, getComponentInstanceKey, cleanupComponentState } from './reactivity';

export type Component<P = {}> = (props: P & { children?: any; key?: any }) => Node;

const componentCache = new Map<string, { node: Node; props: any }>();
const componentEffects = new Map<string | Function, Set<() => void>>();
const nodeToInstanceKey = new WeakMap<Node, string>();
const componentInstanceKeys = new WeakMap<Function, number>();
let componentInstanceCounter = 0;

function findAllComponentInstanceKeys(node: Node): string[] {
  const instanceKeys: string[] = [];
  const instanceKey = (node as any).__instanceKey;
  if (instanceKey) {
    instanceKeys.push(instanceKey);
  }
  
  if (node instanceof Element) {
    for (const child of Array.from(node.childNodes)) {
      instanceKeys.push(...findAllComponentInstanceKeys(child));
    }
  } else if (node instanceof DocumentFragment) {
    for (const child of Array.from(node.childNodes)) {
      instanceKeys.push(...findAllComponentInstanceKeys(child));
    }
  }
  
  return instanceKeys;
}

export function cleanupComponentEffectsByInstanceKey(instanceKey: string) {
  const effects = componentEffects.get(instanceKey);
  if (effects) {
    effects.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error cleaning up component effect:', error);
      }
    });
    effects.clear();
    componentEffects.delete(instanceKey);
  }
  cleanupComponentState(instanceKey);
}

export function cleanupComponentEffectsInNode(node: Node) {
  const instanceKeys = findAllComponentInstanceKeys(node);
  instanceKeys.forEach(instanceKey => {
    cleanupComponentEffectsByInstanceKey(instanceKey);
  });
}

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
    let instanceKey: string;
    if (key) {
      instanceKey = `${type.name || 'Component'}:${key}`;
    } else {
      if (!componentInstanceKeys.has(type)) {
        componentInstanceKeys.set(type, ++componentInstanceCounter);
      }
      instanceKey = `${type.name || 'Component'}:instance:${componentInstanceKeys.get(type)}`;
    }
    
    let effects = componentEffects.get(instanceKey);
    const isFirstRender = !effects;
    
    if (isFirstRender) {
      effects = new Set<() => void>();
      componentEffects.set(instanceKey, effects);
    }
    
    const prevContext = getComponentContext();
    const prevEffectIndex = prevContext ? getComponentEffectIndex() : 0;
    const prevInstanceKey = prevContext ? getComponentInstanceKey() : null;
    
    if (effects) {
      setComponentContext(effects, 0, instanceKey);
    } else {
      setComponentContext(null, 0, null);
    }
    
    try {
      let result: Node;
      if (key) {
        const cacheKey = `${type.name || 'Component'}:${key}`;
        if (componentCache.has(cacheKey)) {
          const cached = componentCache.get(cacheKey)!;
          if (cached.props !== props) {
            cached.props = props;
            result = (type as Component<any>)(props);
            if (result && effects) {
              nodeToInstanceKey.set(result, instanceKey);
              (result as any).__instanceKey = instanceKey;
            }
            return result;
          }
          const cloned = cached.node.cloneNode(true);
          if (cloned && effects) {
            nodeToInstanceKey.set(cloned, instanceKey);
            (cloned as any).__instanceKey = instanceKey;
          }
          return cloned;
        }
        result = (type as Component<any>)(props);
        if (result && effects) {
          nodeToInstanceKey.set(result, instanceKey);
          (result as any).__instanceKey = instanceKey;
        }
        componentCache.set(cacheKey, { node: result.cloneNode(true), props });
        return result;
      }
      result = (type as Component<any>)(props);
      if (result && effects) {
        nodeToInstanceKey.set(result, instanceKey);
        (result as any).__instanceKey = instanceKey;
      }
      return result;
    } finally {
      setComponentContext(prevContext, prevEffectIndex, prevInstanceKey);
    }
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
