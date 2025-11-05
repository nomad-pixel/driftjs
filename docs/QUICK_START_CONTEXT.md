# Context API - Quick Start

## 🚀 Быстрый старт за 60 секунд

### 1. Создайте контекст

```typescript
import { createContext } from 'drift-spa';

type Theme = {
  color: string;
  background: string;
};

const ThemeContext = createContext<Theme>({
  color: '#333',
  background: '#fff'
});
```

### 2. Предоставьте значение

```typescript
import { provide } from 'drift-spa';

const App: FC = () => {
  const theme = {
    color: '#e74c3c',
    background: '#2c3e50'
  };
  
  return () => {
    provide(ThemeContext, theme);
    return <YourComponent />;
  };
};
```

### 3. Используйте значение

```typescript
import { injectContext } from 'drift-spa';

const YourComponent: FC = () => {
  const theme = injectContext(ThemeContext);
  
  return (
    <div style={{ color: theme.color, background: theme.background }}>
      Hello, Context!
    </div>
  );
};
```

## 🎯 Основные паттерны

### Реактивные значения

```typescript
const App: FC = () => {
  let darkMode = state(false);
  
  const theme = computed(() => ({
    color: darkMode.value ? '#fff' : '#333',
    background: darkMode.value ? '#2c3e50' : '#fff'
  }));
  
  return () => {
    provide(ThemeContext, theme());
    return (
      <div>
        <button onClick={() => setState(() => { darkMode.value = !darkMode.value; })}>
          Toggle Theme
        </button>
        <Content />
      </div>
    );
  };
};
```

### Множественные контексты

```typescript
provide(ThemeContext, theme);
provide(UserContext, user);
provide(LanguageContext, 'en');

return <App />;
```

### Dependency Injection

```typescript
type API = {
  fetchUser: (id: number) => Promise<User>;
  fetchPosts: () => Promise<Post[]>;
};

const APIContext = createContext<API>(defaultAPI);

// Provide
provide(APIContext, myCustomAPI);

// Use
const api = injectContext(APIContext);
const user = await api.fetchUser(1);
```

## 📋 Шпаргалка

| Действие | Код |
|----------|-----|
| Создать контекст | `const Ctx = createContext<T>(default)` |
| Предоставить | `provide(Ctx, value)` |
| Получить | `injectContext(Ctx)` |
| Проверить | `hasContext(Ctx)` |
| Provider | `const P = createProvider(Ctx); <P value={v}/>` |

## 💡 Советы

1. **Всегда указывайте тип:** `createContext<MyType>(default)`
2. **Provide в render:** Вызывайте `provide` внутри функции, возвращающей JSX
3. **Разделяйте контексты:** Один контекст = одна задача
4. **Используйте displayName:** `createContext(default, 'MyContext')`

## 🔗 Дальше

- [Полная документация Context API](./CONTEXT_API.md)
- [Примеры](../examples/counter-vite/src/main.tsx)
- [Roadmap](../ROADMAP.md)

