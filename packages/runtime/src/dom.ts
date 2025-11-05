import { effect, getComponentContext, setComponentContext, getComponentInstanceKey, setComponentInstanceKey, getComponentEffectIndex, setComponentEffectIndex } from './reactivity';

export type Child = Node | string | number | boolean | null | undefined | (() => any) | Child[];
export function isNode(v: any): v is Node { return v instanceof Node; }

export function normalizeChild(child: Child): Node {
  if (child == null || child === false) return document.createTextNode('');
  if (isNode(child)) return child;

  if (typeof child === 'function') {
    const container = document.createElement('span');
    container.style.display = 'contents';
    
    const savedContext = getComponentContext();
    const savedInstanceKey = getComponentInstanceKey();
    const savedEffectIndex = getComponentEffectIndex();
    
    setComponentContext(null);
    setComponentInstanceKey(null);
    setComponentEffectIndex(0);
    
    let isInitialized = false;
    effect(() => {
      const v = child();
      
      if (!isInitialized && (v == null || v === false)) {
        return;
      }
      isInitialized = true;
      
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      if (v == null || v === false) {
        return;
      } else if (isNode(v)) {
        container.appendChild(v);
      } else if (Array.isArray(v)) {
        v.forEach(c => {
          if (c != null && c !== false) {
            container.appendChild(normalizeChild(c as any));
          }
        });
      } else {
        container.appendChild(document.createTextNode(String(v)));
      }
    });
    
    setComponentContext(savedContext);
    setComponentInstanceKey(savedInstanceKey);
    setComponentEffectIndex(savedEffectIndex);
    
    return container;
  }

  if (Array.isArray(child)) {
    const frag = document.createDocumentFragment();
    child.forEach(c => frag.appendChild(normalizeChild(c as any)));
    return frag;
  }

  return document.createTextNode(String(child));
}

const eventHandlers = new WeakMap<Element, Map<string, EventListener>>();

export function setProp(el: Element, key: string, value: any) {
  if (key === 'ref' && typeof value === 'function') { value(el); return; }
  if (key === 'className') { (el as any).className = value ?? ''; return; }
  if (key === 'style' && value && typeof value === 'object') {
    Object.assign((el as HTMLElement).style, value);
    return;
  }
  if (/^on[A-Z]/.test(key) && typeof value === 'function') {
    const name = key.slice(2).toLowerCase();
    if (!eventHandlers.has(el)) {
      eventHandlers.set(el, new Map());
    }
    const handlers = eventHandlers.get(el)!;
    const oldHandler = handlers.get(name);
    if (oldHandler) {
      el.removeEventListener(name, oldHandler);
    }
    handlers.set(name, value as EventListener);
    el.addEventListener(name, value as EventListener);
    return;
  }
  if (value == null || value === false) { (el as any).removeAttribute?.(key); return; }
  (el as any).setAttribute?.(key, value === true ? '' : String(value));
}
