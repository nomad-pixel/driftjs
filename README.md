# 🚀 Drift SPA Framework

Modern SPA framework with reactivity, routing, and performance optimizations.

## ✨ Features

- **Reactivity** - Signals, computed values, and effects
- **JSX** - Full JSX syntax support
- **Routing** - Hash and History modes with guards
- **Performance** - Memoization, virtualization, lazy loading
- **DevTools** - Visual reactivity debugging
- **TypeScript** - Complete type safety

## 🚀 Quick Start

```bash
npm install drift-spa
```

```tsx
import { createSignal, createApp, type FC } from 'drift-spa';

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

### Reactivity

#### `createSignal<T>(initial: T, name?: string)`
Creates a reactive signal.

```tsx
const [count, setCount] = createSignal(0, 'counter');
```

#### `createComputed<T>(fn: () => T)`
Creates a computed value.

```tsx
const doubleCount = createComputed(() => count() * 2);
```

#### `effect(fn: () => void)`
Creates an effect that runs when dependencies change.

```tsx
effect(() => {
  console.log('Count changed:', count());
});
```

#### `batch(fn: () => void)`
Batches multiple updates.

```tsx
batch(() => {
  setCount(c => c + 1);
  setStep(s => s + 1);
});
```

### Routing

#### `createRouter(config)`
Creates a router with History and Hash mode support.

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
Simplified hash router.

```tsx
const { RouterView, push } = createHashRouter({
  '/': HomePage,
  '/about': AboutPage
});
```

### Performance

#### `memo(component, areEqual?)`
Component memoization.

```tsx
const MemoComponent = memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

#### `VirtualList`
List virtualization.

```tsx
<VirtualList
  items={largeArray}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item, index) => <Item key={index} data={item} />}
/>
```

#### `lazy(loader)`
Lazy component loading.

```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

### DevTools

#### `devtools.enable()`
Enables the debugging panel.

```tsx
import { devtools } from 'drift-spa';

if (import.meta.env.DEV) {
  devtools.enable();
}
```

Hotkeys: `Ctrl+Shift+D`

## 🎯 Examples

### Simple Counter

```tsx
import { createSignal, createComputed, createApp, type FC } from 'drift-spa';

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

### Routing with Parameters

```tsx
import { createRouter, createSignal, type FC } from 'drift-spa';

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

### Memoized List

```tsx
import { memo, VirtualList } from 'drift-spa';

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

## 🔧 Development

```bash
git clone https://github.com/nomad-pixel/driftjs
cd driftjs
pnpm install
pnpm dev
```

### Project Structure

```
driftjs/
├── packages/
│   └── runtime/          # Main package
│       ├── src/
│       │   ├── reactivity.ts    # Reactivity
│       │   ├── jsx-runtime.ts   # JSX support
│       │   ├── router.ts        # Routing
│       │   ├── performance.ts   # Optimizations
│       │   ├── devtools.ts      # DevTools
│       │   ├── types.ts         # Types
│       │   └── index.ts         # Exports
│       └── dist/                # Build output
└── examples/
    └── counter-vite/     # Example app
```

## 📦 Build

```bash
pnpm build
```

## 🧪 Testing

```bash
pnpm test
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

- GitHub Issues
- Discord: #drift-framework
- Email: support@drift.dev

---

**Drift SPA Framework** - Modern SPA framework for building fast and responsive web applications.