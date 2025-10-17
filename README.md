# 🚀 Drift Framework

Современный SPA фреймворк с реактивностью, роутингом и оптимизациями производительности.

## ✨ Особенности

- **Реактивность** - Сигналы, computed значения и эффекты
- **JSX** - Полная поддержка JSX синтаксиса
- **Роутинг** - Hash и History режимы с guards
- **Производительность** - Мемоизация, виртуализация, ленивая загрузка
- **DevTools** - Визуальная отладка реактивности
- **TypeScript** - Полная типизация

## 🚀 Быстрый старт

```bash
npm install @drift/runtime
```

```tsx
import { createSignal, createApp, type FC } from '@drift/runtime';

const Counter: FC = () => {
  const [count, setCount] = createSignal(0);
  
  return (
    <div>
      <p>Count: {() => count()}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
};

createApp(Counter).mount('#app');
```

## 📚 API

### Реактивность

#### `createSignal<T>(initial: T, name?: string)`
Создает реактивный сигнал.

```tsx
const [count, setCount] = createSignal(0, 'counter');
```

#### `createComputed<T>(fn: () => T)`
Создает вычисляемое значение.

```tsx
const doubleCount = createComputed(() => count() * 2);
```

#### `effect(fn: () => void)`
Создает эффект, который выполняется при изменении зависимостей.

```tsx
effect(() => {
  console.log('Count changed:', count());
});
```

#### `batch(fn: () => void)`
Батчинг множественных обновлений.

```tsx
batch(() => {
  setCount(c => c + 1);
  setStep(s => s + 1);
});
```

### Роутинг

#### `createRouter(config)`
Создает роутер с поддержкой History и Hash режимов.

```tsx
const { RouterView, push, context } = createRouter({
  mode: 'hash',
  routes: {
    '/': HomePage,
    '/user/:id': UserPage,
    '/about': AboutPage
  },
  beforeEach: (to, from) => {
    console.log(`Navigate: ${from} → ${to}`);
    return true;
  }
});
```

#### `createHashRouter(routes)`
Упрощенный hash роутер.

```tsx
const { RouterView, push } = createHashRouter({
  '/': HomePage,
  '/about': AboutPage
});
```

### Производительность

#### `memo(component, areEqual?)`
Мемоизация компонентов.

```tsx
const MemoComponent = memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

#### `VirtualList`
Виртуализация списков.

```tsx
<VirtualList
  items={largeArray}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item, index) => <Item key={index} data={item} />}
/>
```

#### `lazy(loader)`
Ленивая загрузка компонентов.

```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

### DevTools

#### `devtools.enable()`
Включает панель отладки.

```tsx
import { devtools } from '@drift/runtime';

if (import.meta.env.DEV) {
  devtools.enable();
}
```

Горячие клавиши: `Ctrl+Shift+D`

## 🎯 Примеры

### Простой счетчик

```tsx
import { createSignal, createComputed, createApp, type FC } from '@drift/runtime';

const Counter: FC = () => {
  const [count, setCount] = createSignal(0);
  const doubleCount = createComputed(() => count() * 2);
  
  return (
    <div>
      <h1>Counter: {() => count()}</h1>
      <p>Double: {() => doubleCount()}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

createApp(Counter).mount('#app');
```

### Роутинг с параметрами

```tsx
import { createRouter, createSignal, type FC } from '@drift/runtime';

const UserPage: FC<{ params: { id: string } }> = ({ params }) => {
  const [user, setUser] = createSignal(null);
  
  effect(() => {
    fetchUser(params.id).then(setUser);
  });
  
  return (
    <div>
      <h1>User: {() => user()?.name}</h1>
      <p>ID: {params.id}</p>
    </div>
  );
};

const { RouterView } = createRouter({
  mode: 'history',
  routes: {
    '/user/:id': UserPage
  }
});
```

### Мемоизированный список

```tsx
import { memo, VirtualList } from '@drift/runtime';

const UserCard = memo(({ user }) => (
  <div style={{ padding: '8px', border: '1px solid #ccc' }}>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>
));

const UserList = ({ users }) => (
  <VirtualList
    items={users}
    itemHeight={80}
    containerHeight={400}
    renderItem={(user) => <UserCard key={user.id} user={user} />}
  />
);
```

## 🔧 Разработка

```bash
git clone https://github.com/your-org/drift
cd drift
pnpm install
pnpm dev
```

### Структура проекта

```
drift/
├── packages/
│   └── runtime/          # Основной пакет
│       ├── src/
│       │   ├── reactivity.ts    # Реактивность
│       │   ├── jsx-runtime.ts   # JSX поддержка
│       │   ├── router.ts        # Роутинг
│       │   ├── performance.ts   # Оптимизации
│       │   ├── devtools.ts      # DevTools
│       │   ├── types.ts         # Типы
│       │   └── index.ts         # Экспорты
│       └── dist/                # Сборка
└── examples/
    └── counter-vite/     # Пример приложения
```

## 📦 Сборка

```bash
pnpm build
```

## 🧪 Тестирование

```bash
pnpm test
```

## 📄 Лицензия

MIT

## 🤝 Вклад

1. Fork репозиторий
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📞 Поддержка

- GitHub Issues
- Discord: #drift-framework
- Email: support@drift.dev

---

**Drift Framework** - Современный SPA фреймворк для создания быстрых и отзывчивых веб-приложений.
