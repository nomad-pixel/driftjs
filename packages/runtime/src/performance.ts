
import { createSignal, createComputed, effect } from './reactivity';
import type { Component } from './jsx-runtime';


const componentMemoCache = new Map<string, { props: any; result: Node }>();

export function memo<T extends Record<string, any>>(
  component: Component<T>,
  areEqual?: (prev: T, next: T) => boolean
): Component<T> {
  return (props: T) => {
    const cacheKey = `${component.name || 'Component'}:${JSON.stringify(props)}`;
    
    if (componentMemoCache.has(cacheKey)) {
      const cached = componentMemoCache.get(cacheKey)!;
      if (!areEqual || areEqual(cached.props, props)) {
        return cached.result.cloneNode(true);
      }
    }
    
    const result = component(props);
    componentMemoCache.set(cacheKey, { props, result: result.cloneNode(true) });
    
    return result;
  };
}


interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => Node;
  overscan?: number;
}

export function VirtualList<T>(props: VirtualListProps<T>): Node {
  const { items, itemHeight, containerHeight, renderItem, overscan = 5 } = props;
  
  const [scrollTop, setScrollTop] = createSignal(0);
  
  const visibleRange = createComputed(() => {
    const start = Math.max(0, Math.floor(scrollTop() / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop() + containerHeight) / itemHeight) + overscan
    );
    return { start, end };
  });
  
  const visibleItems = createComputed(() => {
    const { start, end } = visibleRange();
    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index
    }));
  });
  
  const totalHeight = items.length * itemHeight;
  const offsetY = createComputed(() => visibleRange().start * itemHeight);
  
  const container = document.createElement('div');
  container.style.cssText = `
    height: ${containerHeight}px;
    overflow-y: auto;
    position: relative;
  `;
  
  const scrollHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  };
  
  container.addEventListener('scroll', scrollHandler);
  
  const viewport = document.createElement('div');
  viewport.style.cssText = `
    height: ${totalHeight}px;
    position: relative;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  `;
  
  effect(() => {
    const items = visibleItems();
    const offset = offsetY();
    
    content.style.transform = `translateY(${offset}px)`;
    content.innerHTML = '';
    
    items.forEach(({ item, index }) => {
      const element = renderItem(item, index);
      content.appendChild(element);
    });
  });
  
  viewport.appendChild(content);
  container.appendChild(viewport);
  
  return container;
}


const lazyComponentCache = new Map<string, Component<any>>();

export function lazy<T extends Record<string, any>>(
  loader: () => Promise<{ default: Component<T> }>,
  fallback?: Component
): Component<T> {
  return (props: T) => {
    const cacheKey = loader.toString();
    
    if (lazyComponentCache.has(cacheKey)) {
      const Component = lazyComponentCache.get(cacheKey)!;
      return Component(props);
    }
    
    
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: #666;
    `;
    placeholder.textContent = 'Загрузка...';
    
    
    loader().then(module => {
      const Component = module.default;
      lazyComponentCache.set(cacheKey, Component);
      
      
      const realComponent = Component(props);
      placeholder.parentNode?.replaceChild(realComponent, placeholder);
    }).catch(error => {
      console.error('Ошибка загрузки компонента:', error);
      placeholder.textContent = 'Ошибка загрузки';
      placeholder.style.color = '#f44336';
    });
    
    return placeholder;
  };
}


export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}


export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = createSignal(false);
  
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const intersecting = entry.isIntersecting;
    setIsIntersecting(intersecting);
    callback(intersecting);
  }, options);
  
  const observe = (element: Element) => {
    observer.observe(element);
  };
  
  const unobserve = (element: Element) => {
    observer.unobserve(element);
  };
  
  const disconnect = () => {
    observer.disconnect();
  };
  
  return {
    isIntersecting,
    observe,
    unobserve,
    disconnect
  };
}


export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}


export function clearCaches() {
  componentMemoCache.clear();
  lazyComponentCache.clear();
}
