import { effect } from './reactivity';
import { normalizeChild, type Child } from './dom';

export interface PortalProps {
  children?: any;
  target?: Element | string;
}

const portals = new WeakMap<Node, Element>();

export function createPortal(children: Child | Child[], target?: Element | string): Node {
  let container: Element;
  
  if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (!element) {
      throw new Error(`Portal target not found: ${target}`);
    }
    container = element;
  } else if (target instanceof Element) {
    container = target;
  } else {
    container = document.body;
  }
  
  const portalContent = document.createDocumentFragment();
  
  if (Array.isArray(children)) {
    children.forEach(child => {
      const normalized = normalizeChild(child as Child);
      portalContent.appendChild(normalized);
      portals.set(normalized, container);
    });
  } else {
    const normalized = normalizeChild(children as Child);
    portalContent.appendChild(normalized);
    portals.set(normalized, container);
  }
  
  container.appendChild(portalContent);
  
  const marker = document.createComment('portal');
  
  return marker;
}

export function Portal(props: PortalProps): Node {
  let container: Element;
  
  if (typeof props.target === 'string') {
    const element = document.querySelector(props.target);
    if (!element) {
      throw new Error(`Portal target not found: ${props.target}`);
    }
    container = element;
  } else if (props.target instanceof Element) {
    container = props.target;
  } else {
    container = document.body;
  }
  
  const marker = document.createComment('portal');
  const portalNodes: Node[] = [];
  
  const renderContent = () => {
    portalNodes.forEach(node => {
      if (node.parentNode === container) {
        container.removeChild(node);
      }
    });
    portalNodes.length = 0;
    
    if (props.children) {
      if (Array.isArray(props.children)) {
        props.children.forEach(child => {
          if (child != null && child !== false) {
            const normalized = normalizeChild(child as Child);
            container.appendChild(normalized);
            portalNodes.push(normalized);
          }
        });
      } else if (props.children != null && props.children !== false) {
        const normalized = normalizeChild(props.children as Child);
        container.appendChild(normalized);
        portalNodes.push(normalized);
      }
    }
  };
  
  renderContent();
  
  effect(() => {
    return () => {
      portalNodes.forEach(node => {
        if (node.parentNode === container) {
          container.removeChild(node);
        }
      });
      portalNodes.length = 0;
    };
  });
  
  return marker;
}

export function getPortalContainer(node: Node): Element | undefined {
  return portals.get(node);
}

export function removePortal(node: Node): void {
  const container = portals.get(node);
  if (container && node.parentNode === container) {
    container.removeChild(node);
    portals.delete(node);
  }
}

