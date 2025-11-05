import { 
  getComponentInstanceKey, 
  getComponentContext, 
  setComponentContext, 
  setComponentInstanceKey, 
  getComponentEffectIndex, 
  setComponentEffectIndex 
} from './reactivity';

export type ServiceScope = 'singleton' | 'transient' | 'scoped';

export interface ServiceOptions {
  scope?: ServiceScope;
  deps?: ServiceClass<any>[];
}

export interface ServiceClass<T = any> {
  new (...args: any[]): T;
}

interface ServiceMetadata<T = any> {
  instance: T | null;
  scope: ServiceScope;
  deps: ServiceClass<any>[];
  factory: () => T;
}

interface ScopedInstances {
  [serviceKey: string]: any;
}

const SERVICE_REGISTRY = new Map<ServiceClass<any>, ServiceMetadata>();
const SCOPED_INSTANCES = new Map<string, ScopedInstances>();

export function provide<T>(
  ServiceClass: ServiceClass<T>,
  options: ServiceOptions = {}
): void {
  const scope = options.scope || 'singleton';
  const deps = options.deps || extractDependencies(ServiceClass);
  
  const factory = () => {
    const resolvedDeps = deps.map(dep => inject(dep));
    const instance = new ServiceClass(...resolvedDeps);
    return instance;
  };
  
  SERVICE_REGISTRY.set(ServiceClass, {
    instance: null,
    scope,
    deps,
    factory
  });
}

export function inject<T>(ServiceClass: ServiceClass<T>): T {
  const metadata = SERVICE_REGISTRY.get(ServiceClass);
  
  if (!metadata) {
    throw new Error(
      `Service ${ServiceClass.name} is not provided. Did you forget to call provide(${ServiceClass.name})?`
    );
  }
  
  if (metadata.scope === 'singleton') {
    if (!metadata.instance) {
      const savedContext = getComponentContext();
      const savedInstanceKey = getComponentInstanceKey();
      const savedEffectIndex = getComponentEffectIndex();
      
      setComponentContext(null);
      setComponentInstanceKey(null);
      setComponentEffectIndex(0);
      
      metadata.instance = metadata.factory();
      
      setComponentContext(savedContext);
      setComponentInstanceKey(savedInstanceKey);
      setComponentEffectIndex(savedEffectIndex);
      
      if (typeof (metadata.instance as any).onInit === 'function') {
        queueMicrotask(() => {
          (metadata.instance as any).onInit();
        });
      }
    }
    return metadata.instance as T;
  }
  
  if (metadata.scope === 'transient') {
    const instance = metadata.factory();
    if (typeof (instance as any).onInit === 'function') {
      queueMicrotask(() => {
        (instance as any).onInit();
      });
    }
    return instance;
  }
  
  if (metadata.scope === 'scoped') {
    const instanceKey = getComponentInstanceKey();
    if (!instanceKey) {
      throw new Error(
        `Service ${ServiceClass.name} has 'scoped' lifetime but was requested outside of a component context`
      );
    }
    
    if (!SCOPED_INSTANCES.has(instanceKey)) {
      SCOPED_INSTANCES.set(instanceKey, {});
    }
    
    const scopedMap = SCOPED_INSTANCES.get(instanceKey)!;
    const serviceKey = ServiceClass.name;
    
    if (!scopedMap[serviceKey]) {
      scopedMap[serviceKey] = metadata.factory();
      if (typeof (scopedMap[serviceKey] as any).onInit === 'function') {
        queueMicrotask(() => {
          (scopedMap[serviceKey] as any).onInit();
        });
      }
    }
    
    return scopedMap[serviceKey];
  }
  
  const instance = metadata.factory();
  if (typeof (instance as any).onInit === 'function') {
    queueMicrotask(() => {
      (instance as any).onInit();
    });
  }
  return instance;
}

function extractDependencies(ServiceClass: ServiceClass<any>): ServiceClass<any>[] {
  const paramTypes = (Reflect as any).getMetadata?.('design:paramtypes', ServiceClass);
  return paramTypes || [];
}

export function cleanupScopedServices(instanceKey: string): void {
  const scopedMap = SCOPED_INSTANCES.get(instanceKey);
  if (scopedMap) {
    Object.values(scopedMap).forEach(instance => {
      if (typeof instance.onDestroy === 'function') {
        instance.onDestroy();
      }
    });
    SCOPED_INSTANCES.delete(instanceKey);
  }
}

export function clearAllServices(): void {
  SERVICE_REGISTRY.forEach((metadata) => {
    if (metadata.instance && typeof metadata.instance.onDestroy === 'function') {
      metadata.instance.onDestroy();
    }
  });
  SERVICE_REGISTRY.clear();
  SCOPED_INSTANCES.clear();
}

export function hasService<T>(ServiceClass: ServiceClass<T>): boolean {
  return SERVICE_REGISTRY.has(ServiceClass);
}

export function getAllServices(): Map<ServiceClass<any>, ServiceMetadata> {
  return SERVICE_REGISTRY;
}

export interface Module {
  providers: (ServiceClass<any> | { provide: ServiceClass<any>; options?: ServiceOptions })[];
  imports?: Module[];
}

export function createModule(config: Module): Module {
  return config;
}

export function provideModule(module: Module): void {
  if (module.imports) {
    module.imports.forEach(importedModule => {
      provideModule(importedModule);
    });
  }
  
  module.providers.forEach(provider => {
    if (typeof provider === 'function') {
      provide(provider);
    } else {
      provide(provider.provide, provider.options);
    }
  });
}

export function Injectable(options: ServiceOptions = {}) {
  return function <T extends ServiceClass<any>>(target: T) {
    provide(target, options);
    return target;
  };
}

type InjectFunction = {
  <T>(ServiceClass: ServiceClass<T>): T;
  all(): Record<string, any>;
};

export const injectAll: InjectFunction = Object.assign(
  function <T>(ServiceClass: ServiceClass<T>): T {
    return inject(ServiceClass);
  },
  {
    all(): Record<string, any> {
      const result: Record<string, any> = {};
      SERVICE_REGISTRY.forEach((metadata, ServiceClass) => {
        result[ServiceClass.name] = inject(ServiceClass);
      });
      return result;
    }
  }
);

