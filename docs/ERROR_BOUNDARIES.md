# Error Boundaries

Error Boundaries в Drift — это компоненты, которые отлавливают JavaScript-ошибки в любой части дерева компонентов, логируют их и отображают fallback UI вместо упавшего дерева компонентов.

## 🎯 Зачем нужны Error Boundaries

- **Предотвращение полного краха приложения** — одна ошибка не уронит всё приложение
- **Graceful degradation** — показ fallback UI вместо пустого экрана
- **Логирование ошибок** — централизованная обработка ошибок
- **Улучшение UX** — пользователь видит понятное сообщение об ошибке

## 📚 API Reference

### `<ErrorBoundary>`

Компонент для отлова ошибок в дереве компонентов.

#### Props

```typescript
interface ErrorBoundaryProps {
  // Fallback UI - может быть функцией или Node
  fallback?: ((error: Error, errorInfo: ErrorInfo, reset: () => void) => Node) | Node;
  
  // Callback при возникновении ошибки
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  // Callback при сбросе ErrorBoundary
  onReset?: () => void;
  
  // Массив зависимостей для автоматического сброса
  resetKeys?: any[];
  
  // Дочерние компоненты
  children: any;
}

interface ErrorInfo {
  error: Error;
  componentStack?: string;
  timestamp: Date;
}
```

---

### `captureError(error, componentStack?)`

Программно отправляет ошибку в ближайший ErrorBoundary.

```typescript
captureError(new Error('Something went wrong'), 'in MyComponent');
```

---

### `useErrorHandler()`

Возвращает функцию для отправки ошибок в ErrorBoundary.

```typescript
const handleError = useErrorHandler();

try {
  // some code
} catch (error) {
  handleError(error, 'in component logic');
}
```

---

### `wrapWithErrorHandling(fn, componentName?)`

Оборачивает функцию для автоматического отлова ошибок.

```typescript
const safeFn = wrapWithErrorHandling(
  () => riskyOperation(),
  'MyComponent'
);
```

## 🚀 Примеры использования

### 1. Базовый пример

```typescript
import { ErrorBoundary, type FC } from 'drift-spa';

const BuggyComponent: FC = () => {
  throw new Error('I crashed!');
};

const App: FC = () => (
  <ErrorBoundary>
    <BuggyComponent />
  </ErrorBoundary>
);
```

По умолчанию ErrorBoundary покажет красивый UI с информацией об ошибке и кнопкой "Try Again".

---

### 2. Кастомный Fallback UI

```typescript
const App: FC = () => (
  <ErrorBoundary
    fallback={(error, errorInfo, reset) => {
      const container = document.createElement('div');
      container.style.cssText = 'padding: 20px; background: #fee; border: 2px solid #f00;';
      
      const title = document.createElement('h2');
      title.textContent = '⚠️ Oops! Something went wrong';
      
      const message = document.createElement('p');
      message.textContent = error.message;
      
      const button = document.createElement('button');
      button.textContent = 'Try Again';
      button.onclick = reset;
      
      container.appendChild(title);
      container.appendChild(message);
      container.appendChild(button);
      
      return container;
    }}
  >
    <BuggyComponent />
  </ErrorBoundary>
);
```

---

### 3. С обработчиками событий

```typescript
const App: FC = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Отправить ошибку в систему логирования
      console.error('Error caught:', error);
      console.error('Error info:', errorInfo);
      
      // Отправить в Sentry, LogRocket и т.д.
      // Sentry.captureException(error);
    }}
    onReset={() => {
      console.log('Error boundary was reset');
      // Очистить состояние, если нужно
    }}
  >
    <App />
  </ErrorBoundary>
);
```

---

### 4. Автоматический сброс с resetKeys

```typescript
const App: FC = () => {
  let userId = state(1);
  
  return (
    <div>
      <button onClick={() => setState(() => { userId.value++; })}>
        Next User
      </button>
      
      <ErrorBoundary 
        resetKeys={[() => userId.value]}
      >
        <UserProfile userId={() => userId.value} />
      </ErrorBoundary>
    </div>
  );
};
```

ErrorBoundary автоматически сбросится при изменении `userId`.

---

### 5. Вложенные Error Boundaries

```typescript
const App: FC = () => (
  <ErrorBoundary>
    <Header />
    
    <ErrorBoundary>
      <Sidebar />
    </ErrorBoundary>
    
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
    
    <Footer />
  </ErrorBoundary>
);
```

Ошибка в `Sidebar` не затронет `MainContent` и наоборот.

---

### 6. Отлов асинхронных ошибок

```typescript
import { captureError, type FC } from 'drift-spa';

const AsyncComponent: FC = () => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    } catch (error) {
      captureError(error as Error, 'in AsyncComponent.fetchData');
    }
  };
  
  return (
    <button onClick={fetchData}>
      Load Data
    </button>
  );
};

const App: FC = () => (
  <ErrorBoundary>
    <AsyncComponent />
  </ErrorBoundary>
);
```

---

### 7. С useErrorHandler

```typescript
import { useErrorHandler, state, setState, type FC } from 'drift-spa';

const DataFetcher: FC = () => {
  const handleError = useErrorHandler();
  let data = state(null);
  
  const loadData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('HTTP error');
      const json = await response.json();
      setState(() => { data.value = json; });
    } catch (error) {
      handleError(error as Error, 'failed to load data');
    }
  };
  
  return (
    <div>
      <button onClick={loadData}>Load</button>
      <div>{() => JSON.stringify(data.value)}</div>
    </div>
  );
};
```

---

### 8. Обертка всего приложения

```typescript
const App: FC = () => (
  <ErrorBoundary
    fallback={(error, errorInfo, reset) => (
      // Красивая страница ошибки
      <ErrorPage error={error} onReset={reset} />
    )}
    onError={(error, errorInfo) => {
      // Отправить в систему мониторинга
      sendToMonitoring(error, errorInfo);
    }}
  >
    <Router>
      <App />
    </Router>
  </ErrorBoundary>
);
```

---

## 🎨 Паттерны использования

### Защита критичных частей

```typescript
const Dashboard: FC = () => (
  <div>
    <Header />
    
    {/* Критичная часть — защищаем */}
    <ErrorBoundary>
      <CriticalWidget />
    </ErrorBoundary>
    
    {/* Менее важная часть — тоже защищаем отдельно */}
    <ErrorBoundary>
      <OptionalWidget />
    </ErrorBoundary>
    
    <Footer />
  </div>
);
```

---

### Route-level Error Boundaries

```typescript
const { RouterView, push } = createRouter({
  mode: 'history',
  routes: {
    '/': () => (
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    ),
    '/profile': () => (
      <ErrorBoundary resetKeys={[location.pathname]}>
        <ProfilePage />
      </ErrorBoundary>
    ),
    '/dashboard': () => (
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    )
  }
});
```

---

### Интеграция с DI

```typescript
export class ErrorReportingService {
  report(error: Error, errorInfo: ErrorInfo) {
    // Отправить в Sentry, Rollbar, etc.
    console.error('Reporting error:', error);
  }
}

provide(ErrorReportingService);

const App: FC = () => {
  const errorReporter = inject(ErrorReportingService);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorReporter.report(error, errorInfo);
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
};
```

---

## ⚠️ Важные замечания

### Что Error Boundaries НЕ отлавливают

Error Boundaries **НЕ** отлавливают ошибки в:

1. **Event handlers** (используйте try-catch или `captureError`)
```typescript
// ❌ Не сработает
<button onClick={() => { throw new Error('Boom'); }}>
  Click
</button>

// ✅ Правильно
<button onClick={() => {
  try {
    riskyOperation();
  } catch (error) {
    captureError(error);
  }
}}>
  Click
</button>
```

2. **Асинхронном коде** (нужно явно вызывать `captureError`)
```typescript
// ❌ Не сработает
const loadData = async () => {
  throw new Error('Async error');
};

// ✅ Правильно
const loadData = async () => {
  try {
    // async operation
  } catch (error) {
    captureError(error, 'in loadData');
  }
};
```

3. **Ошибках в самом ErrorBoundary** (защищайте вложенными boundaries)

---

### Рекомендации

1. **Используйте несколько ErrorBoundary** — не оборачивайте всё приложение одним
2. **Логируйте ошибки** — используйте `onError` для отправки в систему мониторинга
3. **Предоставляйте способ восстановления** — кнопка "Try Again" или автоматический reset через `resetKeys`
4. **Показывайте понятные сообщения** — пользователь должен понимать, что произошло
5. **Тестируйте error states** — убедитесь, что ваш fallback UI работает корректно

---

## 🔧 Интеграция с системами мониторинга

### Sentry

```typescript
import * as Sentry from '@sentry/browser';

const App: FC = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      Sentry.captureException(error, {
        contexts: {
          errorBoundary: {
            componentStack: errorInfo.componentStack,
            timestamp: errorInfo.timestamp
          }
        }
      });
    }}
  >
    <App />
  </ErrorBoundary>
);
```

### Custom Logger Service

```typescript
export class LoggerService {
  error(message: string, error?: Error, context?: any) {
    console.error(message, error, context);
    // Отправить в backend
  }
}

provide(LoggerService);

const App: FC = () => {
  const logger = inject(LoggerService);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Component error', error, errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  );
};
```

---

## 📊 Тестирование

```typescript
import { render, fireEvent } from 'drift-test-utils';
import { ErrorBoundary } from 'drift-spa';

test('ErrorBoundary shows fallback on error', () => {
  const BuggyComponent = () => {
    throw new Error('Test error');
  };
  
  const { getByText } = render(
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
  
  expect(getByText(/something went wrong/i)).toBeInTheDocument();
});

test('ErrorBoundary can reset', () => {
  let shouldThrow = true;
  const BuggyComponent = () => {
    if (shouldThrow) throw new Error('Test error');
    return <div>Success</div>;
  };
  
  const { getByText } = render(
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
  
  expect(getByText(/something went wrong/i)).toBeInTheDocument();
  
  shouldThrow = false;
  fireEvent.click(getByText(/try again/i));
  
  expect(getByText('Success')).toBeInTheDocument();
});
```

---

## 🎯 Best Practices

### 1. Гранулярность

```typescript
// ✅ Хорошо - несколько boundaries для изоляции
<div>
  <ErrorBoundary><Header /></ErrorBoundary>
  <ErrorBoundary><Sidebar /></ErrorBoundary>
  <ErrorBoundary><Content /></ErrorBoundary>
</div>

// ❌ Плохо - один boundary для всего
<ErrorBoundary>
  <Header />
  <Sidebar />
  <Content />
</ErrorBoundary>
```

### 2. Fallback UI

```typescript
// ✅ Хорошо - информативный fallback
<ErrorBoundary
  fallback={(error, _, reset) => (
    <div>
      <h2>Unable to load dashboard</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
      <a href="/">Go Home</a>
    </div>
  )}
>
  <Dashboard />
</ErrorBoundary>

// ❌ Плохо - неинформативный fallback
<ErrorBoundary fallback={<div>Error</div>}>
  <Dashboard />
</ErrorBoundary>
```

### 3. Логирование

```typescript
// ✅ Хорошо - логируем с контекстом
<ErrorBoundary
  onError={(error, errorInfo) => {
    logger.error('Component crashed', {
      error,
      componentStack: errorInfo.componentStack,
      timestamp: errorInfo.timestamp,
      userId: currentUser.id,
      route: location.pathname
    });
  }}
>
  <App />
</ErrorBoundary>
```

---

## 🚀 Преимущества Drift Error Boundaries

1. **Type-safe** — полная типизация props и callbacks
2. **Автоматический reset** — через `resetKeys`
3. **Интеграция с реактивностью** — работает с `state`, `computed`, `effect`
4. **Программный API** — `captureError`, `useErrorHandler`
5. **Вложенность** — можно создавать иерархию boundaries
6. **Lifecycle hooks** — `onError`, `onReset`
7. **Кастомизируемый fallback** — полный контроль над UI

---

## 📖 Дополнительные ресурсы

- [Dependency Injection](./DEPENDENCY_INJECTION.md)
- [Context API](./CONTEXT_API.md)
- [Reactivity System](../README.md#reactivity)

---

## 🐛 Troubleshooting

### ErrorBoundary не ловит ошибку

**Проблема:** Ошибка проходит мимо ErrorBoundary

**Решение:** 
- Убедитесь, что ErrorBoundary находится выше компонента с ошибкой в дереве
- Для асинхронных ошибок используйте `captureError`
- Для event handlers оборачивайте в try-catch

### Fallback UI не обновляется

**Проблема:** После reset показывается старая ошибка

**Решение:** Используйте `resetKeys` для автоматического сброса при изменении данных

```typescript
<ErrorBoundary resetKeys={[() => userId.value]}>
  <UserProfile userId={() => userId.value} />
</ErrorBoundary>
```

### Бесконечный цикл ошибок

**Проблема:** ErrorBoundary сам выбрасывает ошибку

**Решение:** Проверьте fallback UI на наличие ошибок. Оберните во внешний ErrorBoundary.


