# Dependency Injection (DI) System

Drift предоставляет мощную систему Dependency Injection для разделения логики и UI с автоматическим разрешением зависимостей.

## 🎯 Философия: Логика отдельно, UI отдельно

```typescript
// ========================================
// ЛОГИКА: services/counter.service.ts
// ========================================
export class CounterService {
  count = state(0);
  
  increment() {
    setState(() => { this.count.value++; });
  }
  
  onInit() {
    console.log('Service initialized');
  }
}

// ========================================
// РЕГИСТРАЦИЯ: main.tsx
// ========================================
provide(CounterService);

// ========================================
// UI: Компонент
// ========================================
const Counter: FC = () => {
  const counter = inject(CounterService);
  
  return (
    <div>
      <p>Count: {() => counter.count.value}</p>
      <button onClick={() => counter.increment()}>+</button>
    </div>
  );
};
```

## 📚 API Reference

### `provide<T>(ServiceClass, options?)`

Регистрирует сервис в DI-контейнере.

**Параметры:**
- `ServiceClass` - класс сервиса
- `options` - опции регистрации
  - `scope?: 'singleton' | 'transient' | 'scoped'` - время жизни
  - `deps?: ServiceClass[]` - зависимости (автоматически извлекаются из constructor)

```typescript
// Singleton (по умолчанию) - один инстанс на всё приложение
provide(ThemeService);

// Transient - новый инстанс каждый раз
provide(CacheService, { scope: 'transient' });

// Scoped - один инстанс на поддерево компонентов
provide(FormService, { scope: 'scoped' });

// С явным указанием зависимостей
provide(CounterService, { deps: [LoggerService] });
```

---

### `inject<T>(ServiceClass): T`

Получает инстанс сервиса из DI-контейнера.

```typescript
const theme = inject(ThemeService);
const logger = inject(LoggerService);
const api = inject(ApiService);
```

---

### `hasService<T>(ServiceClass): boolean`

Проверяет, зарегистрирован ли сервис.

```typescript
if (hasService(ThemeService)) {
  // Сервис доступен
}
```

---

### `clearAllServices(): void`

Очищает все сервисы (вызывает `onDestroy` для всех инстансов).

```typescript
clearAllServices();
```

---

### `createModule(config): Module`

Создает модуль с группой сервисов.

```typescript
const CoreModule = createModule({
  providers: [
    LoggerService,
    ApiService,
    { provide: ThemeService, options: { scope: 'singleton' } }
  ],
  imports: [OtherModule]
});
```

---

### `provideModule(module): void`

Регистрирует все сервисы из модуля.

```typescript
provideModule(CoreModule);
```

---

### `@Injectable(options?)` (Decorator)

Декоратор для автоматической регистрации сервиса (опционально).

```typescript
@Injectable({ scope: 'singleton' })
export class MyService {
  // ...
}
```

## 🎨 Service Scopes

### 1. Singleton (по умолчанию)

Один инстанс на всё приложение. Создается при первом `inject()`.

```typescript
provide(ThemeService); // singleton по умолчанию

const theme1 = inject(ThemeService);
const theme2 = inject(ThemeService);
// theme1 === theme2 ✅
```

**Когда использовать:**
- Глобальное состояние (theme, auth, config)
- Сервисы без состояния (API clients)
- Кэши и хранилища

### 2. Transient

Новый инстанс при каждом `inject()`.

```typescript
provide(TempService, { scope: 'transient' });

const temp1 = inject(TempService);
const temp2 = inject(TempService);
// temp1 !== temp2 ✅
```

**Когда использовать:**
- Временные сервисы
- Сервисы со специфическим состоянием для каждого использования

### 3. Scoped

Один инстанс на поддерево компонентов.

```typescript
provide(FormService, { scope: 'scoped' });

// В компоненте A и его детях - один инстанс
// В компоненте B и его детях - другой инстанс
```

**Когда использовать:**
- Сервисы для форм
- Локальное состояние части приложения

## 🔄 Lifecycle Hooks

Сервисы могут иметь lifecycle hooks:

```typescript
export class MyService {
  onInit() {
    console.log('Service initialized');
    // Подписка на события, загрузка данных и т.д.
  }
  
  onDestroy() {
    console.log('Service destroyed');
    // Отписка, очистка ресурсов
  }
}
```

**Когда вызываются:**
- `onInit()` - сразу после создания инстанса
- `onDestroy()` - при `cleanupScopedServices()` или `clearAllServices()`

## 💎 Автоматическое разрешение зависимостей

Drift автоматически разрешает зависимости через constructor:

```typescript
export class CounterService {
  constructor(
    private logger: LoggerService,
    private storage: StorageService
  ) {}
  
  increment() {
    this.logger.info('Incremented');
    this.storage.save('count', this.count.value);
  }
}

// Регистрация (порядок важен!)
provide(LoggerService);
provide(StorageService);
provide(CounterService); // Автоматически получит logger и storage
```

**Примечание:** Зависимости должны быть зарегистрированы **до** сервиса, который их использует.

## 🏗️ Структура проекта с DI

```
src/
├── services/
│   ├── theme.service.ts      # Бизнес-логика theme
│   ├── auth.service.ts       # Аутентификация
│   ├── api.service.ts        # HTTP-запросы
│   ├── logger.service.ts     # Логирование
│   └── counter.service.ts    # Логика счетчика
├── components/
│   ├── ThemedButton.tsx      # UI-компоненты
│   ├── UserProfile.tsx
│   └── Counter.tsx
├── modules/
│   ├── core.module.ts        # Модуль с базовыми сервисами
│   └── feature.module.ts     # Модуль фичи
└── main.tsx                  # Регистрация и запуск
```

## 📖 Примеры

### 1. Простой сервис с state

```typescript
// services/theme.service.ts
import { state, computed, setState } from 'drift-spa';

export class ThemeService {
  isDark = state(false);
  
  get theme() {
    return computed(() => ({
      bg: this.isDark.value ? '#2c3e50' : '#fff',
      color: this.isDark.value ? '#ecf0f1' : '#333'
    }));
  }
  
  toggle() {
    setState(() => {
      this.isDark.value = !this.isDark.value;
    });
  }
  
  onInit() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setState(() => {
        this.isDark.value = saved === 'dark';
      });
    }
  }
  
  onDestroy() {
    localStorage.setItem('theme', this.isDark.value ? 'dark' : 'light');
  }
}

// main.tsx
provide(ThemeService);

// Component.tsx
const App: FC = () => {
  const theme = inject(ThemeService);
  
  return (
    <div style={{ background: () => theme.theme().bg }}>
      <button onClick={() => theme.toggle()}>Toggle</button>
    </div>
  );
};
```

### 2. Сервис с зависимостями

```typescript
// services/counter.service.ts
export class CounterService {
  count = state(0);
  
  constructor(
    private logger: LoggerService
  ) {}
  
  increment() {
    setState(() => { this.count.value++; });
    this.logger.info(`Count: ${this.count.value}`);
  }
  
  onInit() {
    this.logger.info('CounterService initialized');
  }
}

// main.tsx
provide(LoggerService);
provide(CounterService); // Автоматически получит LoggerService
```

### 3. API Service

```typescript
// services/api.service.ts
export class ApiService {
  private baseUrl = 'https://api.example.com';
  
  async fetchUser(id: number) {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return response.json();
  }
  
  async fetchPosts() {
    const response = await fetch(`${this.baseUrl}/posts`);
    return response.json();
  }
  
  onInit() {
    console.log('API Service ready');
  }
}

// Component.tsx
const UserProfile: FC<{ userId: number }> = (props) => {
  const api = inject(ApiService);
  const logger = inject(LoggerService);
  
  let user = state<User | null>(null);
  let loading = state(false);
  
  const loadUser = async () => {
    setState(() => { loading.value = true; });
    try {
      const data = await api.fetchUser(props.userId);
      setState(() => { user.value = data; });
      logger.info('User loaded');
    } catch (err) {
      logger.error('Failed to load user');
    } finally {
      setState(() => { loading.value = false; });
    }
  };
  
  effect(() => {
    loadUser();
  }, []);
  
  return () => loading.value ? <div>Loading...</div> : <div>{user.value?.name}</div>;
};
```

### 4. Модули

```typescript
// modules/core.module.ts
import { createModule } from 'drift-spa';
import { LoggerService } from '../services/logger.service';
import { ApiService } from '../services/api.service';
import { ThemeService } from '../services/theme.service';

export const CoreModule = createModule({
  providers: [
    LoggerService,
    ApiService,
    ThemeService
  ]
});

// modules/feature.module.ts
export const FeatureModule = createModule({
  providers: [
    CounterService,
    UserService
  ],
  imports: [CoreModule]
});

// main.tsx
provideModule(FeatureModule);
```

### 5. Гибридный подход: Services + Inline logic

```typescript
const ProfilePage: FC = () => {
  // DI: Глобальные сервисы
  const auth = inject(AuthService);
  const api = inject(ApiService);
  const logger = inject(LoggerService);
  
  // Inline: Локальный UI state
  let isEditing = state(false);
  let formErrors = state<string[]>([]);
  let isSaving = state(false);
  
  const saveProfile = async (data: ProfileData) => {
    setState(() => { isSaving.value = true; });
    try {
      await api.updateProfile(data);
      logger.info('Profile saved');
      setState(() => { isEditing.value = false; });
    } catch (err) {
      logger.error('Save failed');
      setState(() => { 
        formErrors.value = ['Failed to save profile']; 
      });
    } finally {
      setState(() => { isSaving.value = false; });
    }
  };
  
  return (
    <div>
      <h1>Welcome, {() => auth.user.value?.name}</h1>
      
      {() => isEditing.value ? (
        <EditForm 
          onSave={saveProfile}
          loading={() => isSaving.value}
          errors={() => formErrors.value}
        />
      ) : (
        <ViewProfile user={() => auth.user.value} />
      )}
      
      <button onClick={() => setState(() => { isEditing.value = !isEditing.value; })}>
        {() => isEditing.value ? 'Cancel' : 'Edit'}
      </button>
    </div>
  );
};
```

## 🎯 Лучшие практики

### 1. Одна ответственность

```typescript
// ✅ Хорошо
class ThemeService { /* только тема */ }
class AuthService { /* только аутентификация */ }

// ❌ Плохо
class AppService { 
  /* и тема, и auth, и API */ 
}
```

### 2. Используйте lifecycle hooks

```typescript
// ✅ Хорошо
export class WebSocketService {
  private socket: WebSocket | null = null;
  
  onInit() {
    this.socket = new WebSocket('ws://...');
  }
  
  onDestroy() {
    this.socket?.close();
  }
}
```

### 3. Явные зависимости

```typescript
// ✅ Хорошо - видны зависимости
constructor(
  private logger: LoggerService,
  private api: ApiService
) {}

// ❌ Плохо - скрытые зависимости
private logger = inject(LoggerService); // НЕ делайте так
```

### 4. Регистрируйте зависимости первыми

```typescript
// ✅ Хорошо
provide(LoggerService);
provide(ApiService);
provide(CounterService); // зависит от Logger

// ❌ Плохо
provide(CounterService); // ошибка! Logger еще не зарегистрирован
provide(LoggerService);
```

### 5. Используйте modules для группировки

```typescript
// ✅ Хорошо
provideModule(CoreModule);
provideModule(FeatureModule);

// ❌ Плохо - десятки отдельных provide()
provide(Service1);
provide(Service2);
// ... 20 строк
```

## 🔄 Сравнение с другими фреймворками

### Angular Dependency Injection

```typescript
// Angular
@Injectable()
export class MyService {}

constructor(private service: MyService) {}

// Drift
export class MyService {}

provide(MyService);
const service = inject(MyService);
```

### React Context/Hooks

```typescript
// React
const MyContext = createContext();
<MyContext.Provider value={service}>
const service = injectContext(MyContext);

// Drift
provide(MyService);
const service = inject(MyService);
```

### Vue Provide/Inject

```typescript
// Vue
provide('service', service);
const service = inject('service');

// Drift
provide(MyService);
const service = inject(MyService);
```

## 🚀 Преимущества Drift DI

1. **Type-safe** - полная типизация, никаких строк
2. **Автоматическое разрешение зависимостей** - через constructor
3. **Lifecycle hooks** - `onInit` / `onDestroy`
4. **Multiple scopes** - singleton / transient / scoped
5. **Модульная система** - группировка сервисов
6. **Интеграция с реактивностью** - `state`/`computed` внутри сервисов
7. **Простой API** - всего 2 функции: `provide` и `inject`
8. **Гибкость** - можно писать inline логику когда нужно

## 🐛 Troubleshooting

### Ошибка: "Service X is not provided"

**Решение:** Зарегистрируйте сервис через `provide()` перед использованием.

```typescript
provide(MyService); // Добавьте эту строку
const service = inject(MyService);
```

### Ошибка: Зависимость не найдена

**Решение:** Зарегистрируйте зависимости **до** сервиса, который их использует.

```typescript
provide(LoggerService); // Сначала зависимость
provide(CounterService); // Потом сервис, который её использует
```

### Проблема: Старые данные после навигации

**Решение:** Используйте `scoped` вместо `singleton` для сервисов с локальным состоянием.

```typescript
provide(FormService, { scope: 'scoped' });
```

## 📖 Дополнительные ресурсы

- [Context API](./CONTEXT_API.md)
- [Reactivity System](./REACTIVITY.md)
- [Best Practices](./BEST_PRACTICES.md)

