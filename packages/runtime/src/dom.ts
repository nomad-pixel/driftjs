import { effect } from './reactivity';

export type Child = Node | string | number | boolean | null | undefined | (() => any) | Child[];
export function isNode(v: any): v is Node { return v instanceof Node; }

export function normalizeChild(child: Child): Node {
  if (child == null || child === false) return document.createTextNode('');
  if (isNode(child)) return child;

  if (typeof child === 'function') {
    const text = document.createTextNode('');
    effect(() => {
      const v = child();
      text.textContent = v == null ? '' : String(v);
    });
    return text;
  }

  if (Array.isArray(child)) {
    const frag = document.createDocumentFragment();
    child.forEach(c => frag.appendChild(normalizeChild(c as any)));
    return frag;
  }

  return document.createTextNode(String(child));
}

export function setProp(el: Element, key: string, value: any) {
  if (key === 'ref' && typeof value === 'function') { value(el); return; }
  if (key === 'className') { (el as any).className = value ?? ''; return; }
  if (key === 'style' && value && typeof value === 'object') {
    Object.assign((el as HTMLElement).style, value);
    return;
  }
  if (/^on[A-Z]/.test(key) && typeof value === 'function') {
    const name = key.slice(2).toLowerCase();
    el.addEventListener(name, value as EventListener);
    return;
  }
  if (value == null || value === false) { (el as any).removeAttribute?.(key); return; }
  (el as any).setAttribute?.(key, value === true ? '' : String(value));
}
