# drift-spa

Modern SPA framework with reactivity, JSX, routing & DevTools.

## Installation

```bash
npm install drift-spa
```

## Quick Start

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

## Features

- **Reactivity** - Signals, computed values, effects
- **JSX** - Full JSX support with TypeScript
- **Routing** - Hash/History modes with guards
- **Performance** - Memoization, virtualization, lazy loading
- **DevTools** - Visual debugging panel

## Documentation

See the main [Drift SPA Framework documentation](https://github.com/nomad-pixel/driftjs#readme).

## License

MIT
