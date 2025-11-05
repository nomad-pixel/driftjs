# Context API

Context API в Drift позволяет передавать данные через дерево компонентов без prop drilling, а также реализовывать Dependency Injection для сервисов и утилит.

## 🎯 Основные концепции

### 1. Создание контекста

```typescript
import { createContext } from 'drift-spa';

type Theme = {
  primaryColor: string;
  backgroundColor: string;
};

const ThemeContext = createContext<Theme>({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff'
}, 'ThemeContext'); // displayName опционален
```

### 2. Предоставление значения (provide)

```typescript
import { provide } from 'drift-spa';

const MyComponent: FC = () => {
  const theme = {
    primaryColor: '#e74c3c',
    backgroundColor: '#2c3e50'
  };
  
  // Внутри render function
  return () => {
    provide(ThemeContext, theme);
    return <ChildComponent />;
  };
};
```

### 3. Получение значения (injectContext)

```typescript
import { injectContext } from 'drift-spa';

const ChildComponent: FC = () => {
  const theme = injectContext(ThemeContext);
  
  return (
    <div style={{ background: theme.backgroundColor }}>
      <p style={{ color: theme.primaryColor }}>Themed content</p>
    </div>
  );
};
```

## 📚 API Reference

### `createContext<T>(defaultValue: T, displayName?: string): Context<T>`

Создает новый контекст с типом `T` и значением по умолчанию.

**Параметры:**
- `defaultValue` - значение, которое будет использовано, если контекст не найден
- `displayName` (опционально) - имя для отладки

**Возвращает:** объект `Context<T>`

```typescript
const UserContext = createContext<User | null>(null, 'UserContext');
```

---

### `provide<T>(context: Context<T>, value: T): void`

Предоставляет значение для контекста в текущем компоненте и его потомках.

**Параметры:**
- `context` - контекст, созданный через `createContext`
- `value` - значение для контекста

```typescript
provide(ThemeContext, { primaryColor: '#3498db', backgroundColor: '#fff' });
```

---

### `inject<T>(context: Context<T>): T`

Получает значение из контекста. Если контекст не найден, возвращает `defaultValue`.

**Параметры:**
- `context` - контекст для получения значения

**Возвращает:** значение типа `T`

```typescript
const theme = inject(ThemeContext);
```

**С кастомным fallback:**

```typescript
const theme = inject(ThemeContext, customDefaultTheme);
```

---

---

### `createProvider<T>(context: Context<T>): Component<ProviderProps<T>>`

Создает Provider-компонент для контекста (альтернативный подход, похожий на React).

```typescript
const ThemeProvider = createProvider(ThemeContext);

<ThemeProvider value={theme}>
  <App />
</ThemeProvider>
```

---

### `hasContext<T>(context: Context<T>): boolean`

Проверяет, существует ли значение для данного контекста.

```typescript
if (hasContext(ThemeContext)) {
  // Контекст доступен
}
```

---

### `cleanupContext(instanceKey: string): void`

Очищает контекст для конкретного инстанса компонента. Вызывается автоматически при unmount.

## 🎨 Примеры использования

### 1. Простой Theme Context

```typescript
import { createContext, provideContext, injectContext, state, setState, computed } from 'drift-spa';

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

const ThemeContext = createContext<Theme>({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff',
  textColor: '#333333'
});

// Компонент, использующий тему
const ThemedButton: FC = () => {
  const theme = injectContext(ThemeContext);
  
  return (
    <button style={{ 
      background: theme.primaryColor,
      color: '#fff',
      padding: '0.5rem 1rem'
    }}>
      Click me
    </button>
  );
};

// Родительский компонент с темой
const App: FC = () => {
  let isDark = state(false);
  
  const theme = computed(() => ({
    primaryColor: isDark.value ? '#e74c3c' : '#3498db',
    backgroundColor: isDark.value ? '#2c3e50' : '#ffffff',
    textColor: isDark.value ? '#ecf0f1' : '#333333'
  }));
  
  return (
    <div>
      <button onClick={() => setState(() => { isDark.value = !isDark.value; })}>
        Toggle Theme
      </button>
      
      {() => {
        provide(ThemeContext, theme());
        return <ThemedButton />;
      }}
    </div>
  );
};
```

### 2. User Authentication Context

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

const UserContext = createContext<User | null>(null);

const UserProfile: FC = () => {
  const user = injectContext(UserContext);
  
  if (!user) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

const App: FC = () => {
  let currentUser = state<User | null>(null);
  
  const login = () => {
    setState(() => {
      currentUser.value = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };
    });
  };
  
  return () => {
    provide(UserContext, currentUser.value);
    return (
      <div>
        <button onClick={login}>Login</button>
        <UserProfile />
      </div>
    );
  };
};
```

### 3. Dependency Injection (Services)

```typescript
type Logger = {
  log: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const LoggerContext = createContext<Logger>({
  log: console.log,
  error: console.error,
  info: console.info
});

// Кастомная реализация Logger
class CustomLogger implements Logger {
  private logs: string[] = [];
  
  log(msg: string) {
    this.logs.push(`[LOG] ${msg}`);
    console.log(msg);
  }
  
  error(msg: string) {
    this.logs.push(`[ERROR] ${msg}`);
    console.error(msg);
  }
  
  info(msg: string) {
    this.logs.push(`[INFO] ${msg}`);
    console.info(msg);
  }
  
  getLogs() {
    return this.logs;
  }
}

// Компонент, использующий Logger
const MyComponent: FC = () => {
  const logger = injectContext(LoggerContext);
  
  effect(() => {
    logger.info('Component mounted');
    return () => logger.info('Component unmounted');
  }, []);
  
  return (
    <button onClick={() => logger.log('Button clicked')}>
      Click me
    </button>
  );
};

// Провайдер сервиса
const App: FC = () => {
  const logger = new CustomLogger();
  
  return () => {
    provide(LoggerContext, logger);
    return <MyComponent />;
  };
};
```

### 4. Вложенные контексты

```typescript
const ThemeContext = createContext<Theme>(defaultTheme);
const UserContext = createContext<User | null>(null);
const LanguageContext = createContext<string>('en');

const App: FC = () => {
  let theme = state(lightTheme);
  let user = state<User | null>(null);
  let language = state('en');
  
  return () => {
    provide(ThemeContext, theme.value);
    provide(UserContext, user.value);
    provide(LanguageContext, language.value);
    
    return (
      <div>
        <Header />
        <Content />
        <Footer />
      </div>
    );
  };
};

// Любой дочерний компонент может получить доступ ко всем контекстам
const SomeDeepComponent: FC = () => {
  const theme = injectContext(ThemeContext);
  const user = injectContext(UserContext);
  const language = injectContext(LanguageContext);
  
  return <div>All contexts available here!</div>;
};
```

### 5. Реактивные значения в контексте

```typescript
import { effect } from 'drift-spa';

const CountContext = createContext(0);

const ParentComponent: FC = () => {
  let count = state(0);
  
  // Автоматически обновляем контекст при изменении state
  effect(() => {
    provide(CountContext, count.value);
  }, [count]);
  
  return (
    <div>
      <button onClick={() => setState(() => { count.value++; })}>
        Increment
      </button>
      <ChildComponent />
    </div>
  );
};

const ChildComponent: FC = () => {
  const count = injectContext(CountContext);
  return <p>Count: {count}</p>;
};
```

## 🎯 Лучшие практики

### 1. Type Safety

Всегда используйте типизацию для контекстов:

```typescript
// ✅ Хорошо
const ThemeContext = createContext<Theme>(defaultTheme);

// ❌ Плохо
const ThemeContext = createContext(defaultTheme); // Type inference может не сработать
```

### 2. Default Values

Предоставляйте разумные значения по умолчанию:

```typescript
// ✅ Хорошо - полный объект
const ThemeContext = createContext<Theme>({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff',
  textColor: '#333333'
});

// ⚠️ Допустимо для nullable типов
const UserContext = createContext<User | null>(null);

// ❌ Плохо - undefined может вызвать ошибки
const ThemeContext = createContext<Theme>(undefined as any);
```

### 3. DisplayName для отладки

Используйте displayName для упрощения отладки:

```typescript
const ThemeContext = createContext<Theme>(defaultTheme, 'ThemeContext');
const UserContext = createContext<User | null>(null, 'UserContext');
```

### 4. Размещение provide

Вызывайте `provide` внутри render-функций для корректной работы:

```typescript
// ✅ Хорошо
const App: FC = () => {
  let theme = state(defaultTheme);
  
  return () => {
    provide(ThemeContext, theme.value);
    return <Content />;
  };
};

// ❌ Плохо - provide вне render-функции
const App: FC = () => {
  let theme = state(defaultTheme);
  provide(ThemeContext, theme.value); // Не сработает!
  
  return <Content />;
};
```

### 5. Композиция контекстов

Создавайте отдельные контексты для различных concerns:

```typescript
// ✅ Хорошо - разделенные контексты
const ThemeContext = createContext<Theme>(defaultTheme);
const UserContext = createContext<User | null>(null);
const RouterContext = createContext<Router>(router);

// ❌ Плохо - всё в одном контексте
const AppContext = createContext<{
  theme: Theme;
  user: User | null;
  router: Router;
}>({ theme, user, router });
```

### 6. Избегайте лишних provide

Не вызывайте `provide` на каждом рендере, если значение не изменилось:

```typescript
// ✅ Хорошо - provide только при изменении
const App: FC = () => {
  let theme = state(defaultTheme);
  
  effect(() => {
    provide(ThemeContext, theme.value);
  }, [theme]);
  
  return <Content />;
};
```

## 🔄 Сравнение с другими фреймворками

### React Context

```typescript
// React
const ThemeContext = React.createContext(defaultTheme);
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>
const theme = injectContext(ThemeContext);

// Drift
const ThemeContext = createContext(defaultTheme);
provide(ThemeContext, theme);
const theme = injectContext(ThemeContext);
```

### Vue Provide/Inject

```typescript
// Vue
provide('theme', theme);
const theme = inject('theme');

// Drift
const ThemeContext = createContext(defaultTheme);
provide(ThemeContext, theme);
const theme = inject(ThemeContext);
```

### Solid Context

```typescript
// Solid
const ThemeContext = createContext();
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>
const theme = injectContext(ThemeContext);

// Drift
const ThemeContext = createContext(defaultTheme);
provide(ThemeContext, theme);
const theme = injectContext(ThemeContext);
```

## 🚀 Преимущества Drift Context API

1. **Type-safe** - полная поддержка TypeScript из коробки
2. **Простой API** - всего 3 основных функции: `createContext`, `provideContext`, `injectContext`
3. **Реактивный** - работает с системой реактивности Drift (`state`, `computed`, `effect`)
4. **Легковесный** - минимальный overhead
5. **Автоматическая очистка** - контексты автоматически очищаются при unmount компонентов
6. **DI-ready** - идеально подходит для Dependency Injection сервисов

## 🐛 Troubleshooting

### Проблема: "Cannot read property 'value' of undefined"

**Решение:** Убедитесь, что `provide` вызывается до `inject`:

```typescript
// ✅ Правильный порядок
provide(ThemeContext, theme);
return <ChildThatUsesTheme />;
```

### Проблема: Контекст не обновляется

**Решение:** Используйте `effect` для автоматического обновления:

```typescript
effect(() => {
  provide(ThemeContext, theme.value);
}, [theme]);
```

### Проблема: Утечка памяти

**Решение:** Контексты автоматически очищаются при unmount. Если проблема сохраняется, проверьте, что компоненты корректно unmount'ятся.

## 📖 Дополнительные ресурсы

- [Reactivity System](./REACTIVITY.md)
- [Component Lifecycle](./LIFECYCLE.md)
- [Best Practices](./BEST_PRACTICES.md)

