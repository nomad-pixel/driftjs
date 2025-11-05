# Dependency Injection - Quick Start

## 🚀 За 2 минуты

### 1. Создайте сервис

```typescript
// services/counter.service.ts
import { state, setState } from 'drift-spa';

export class CounterService {
  count = state(0);
  
  increment() {
    setState(() => { this.count.value++; });
  }
  
  onInit() {
    console.log('CounterService ready!');
  }
}
```

### 2. Зарегистрируйте сервис

```typescript
// main.tsx
import { provide } from 'drift-spa';
import { CounterService } from './services/counter.service';

provide(CounterService);
```

### 3. Используйте в компонентах

```typescript
// Component.tsx
import { inject } from 'drift-spa';
import { CounterService } from './services/counter.service';

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

## 🎯 С зависимостями

```typescript
// services/logger.service.ts
export class LoggerService {
  log(msg: string) {
    console.log(msg);
  }
}

// services/counter.service.ts
export class CounterService {
  count = state(0);
  
  constructor(private logger: LoggerService) {}
  
  increment() {
    setState(() => { this.count.value++; });
    this.logger.log(`Count: ${this.count.value}`);
  }
}

// main.tsx
provide(LoggerService);
provide(CounterService); // Автоматически получит LoggerService!
```

## 💡 Зачем это нужно?

### ❌ Без DI (prop drilling)

```typescript
const App = () => {
  const logger = new LoggerService();
  return <Page logger={logger} />;
};

const Page = ({ logger }) => {
  return <Component logger={logger} />;
};

const Component = ({ logger }) => {
  return <Button logger={logger} />;
};

const Button = ({ logger }) => {
  logger.log('clicked');
  // ...
};
```

### ✅ С DI (чисто и просто)

```typescript
provide(LoggerService);

const Button = () => {
  const logger = inject(LoggerService);
  logger.log('clicked');
  // ...
};
```

## 📋 Шпаргалка

| Действие | Код |
|----------|-----|
| Создать сервис | `class MyService {}` |
| Зарегистрировать | `provide(MyService)` |
| Получить | `inject(MyService)` |
| Singleton | `provide(MyService)` ← по умолчанию |
| Transient | `provide(MyService, { scope: 'transient' })` |
| С зависимостями | `constructor(private dep: DepService) {}` |

## 🔗 Дальше

- [Полная документация DI](./DEPENDENCY_INJECTION.md)
- [Примеры сервисов](../examples/counter-vite/src/services/)
- [Context API](./CONTEXT_API.md)

