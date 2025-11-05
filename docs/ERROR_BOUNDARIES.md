# Error Boundaries

Error Boundaries provide a way to gracefully handle JavaScript errors in your Drift application, preventing the entire app from crashing when an error occurs in a component.

## Basic Usage

Wrap any part of your component tree with an `ErrorBoundary`:

```typescript
import { ErrorBoundary } from 'drift-spa';

const App = () => {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
};
```

## Default Fallback UI

By default, ErrorBoundary displays a styled error message with:
- Error title
- Error message
- Collapsible stack trace
- "Try again" button to reset the error

## Custom Fallback UI

Provide your own fallback UI:

```typescript
<ErrorBoundary
  fallback={(error, errorInfo, reset) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <h1>Oops! Something went wrong</h1>
      <p>${error.message}</p>
      <button onclick="${reset}">Retry</button>
    `;
    return container;
  }}
>
  <BuggyComponent />
</ErrorBoundary>
```

## Error Callbacks

Handle errors programmatically:

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error caught:', error);
    console.error('Component stack:', errorInfo.componentStack);
    // Send to error tracking service
    sendToErrorTracking(error, errorInfo);
  }}
  onReset={() => {
    console.log('Error boundary was reset');
    // Perform cleanup or state reset
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Automatic Reset with Keys

Automatically reset the error boundary when certain values change:

```typescript
const App = () => {
  let userId = state(1);
  
  return (
    <ErrorBoundary
      resetKeys={[() => userId.value]}
      onReset={() => console.log('User changed, resetting errors')}
    >
      <UserProfile userId={() => userId.value} />
    </ErrorBoundary>
  );
};
```

When `userId.value` changes, the error boundary automatically resets and re-renders children.

## Nested Error Boundaries

Error boundaries can be nested to provide granular error handling:

```typescript
<ErrorBoundary fallback={(error) => <AppError error={error} />}>
  <Header />
  
  <ErrorBoundary fallback={(error) => <SidebarError error={error} />}>
    <Sidebar />
  </ErrorBoundary>
  
  <ErrorBoundary fallback={(error) => <ContentError error={error} />}>
    <MainContent />
  </ErrorBoundary>
</ErrorBoundary>
```

Errors in `Sidebar` won't affect `Header` or `MainContent`.

## Capturing Async Errors

For errors in async operations (promises, async functions), use `captureError`:

```typescript
import { captureError } from 'drift-spa';

const AsyncComponent = () => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    } catch (error) {
      captureError(error, 'in AsyncComponent.fetchData');
    }
  };
  
  return (
    <button onClick={fetchData}>
      Load Data
    </button>
  );
};

// Wrap with ErrorBoundary
<ErrorBoundary>
  <AsyncComponent />
</ErrorBoundary>
```

## Error Handler Hook

Use `useErrorHandler` to get an error handler function:

```typescript
import { useErrorHandler } from 'drift-spa';

const Component = () => {
  const handleError = useErrorHandler();
  
  const riskyOperation = () => {
    try {
      // ... risky code
    } catch (error) {
      handleError(error, 'in riskyOperation');
    }
  };
  
  return <button onClick={riskyOperation}>Do Something</button>;
};
```

## Global Error Handling

Error boundaries automatically catch:
- ✅ Component render errors
- ✅ `window.error` events (when boundary is active)
- ✅ `unhandledrejection` events (when boundary is active)

## ErrorInfo Object

The `ErrorInfo` object passed to `onError` and `fallback` contains:

```typescript
interface ErrorInfo {
  componentStack?: string;  // Where the error occurred
  errorBoundary?: string;   // Name of the boundary that caught it
}
```

## Best Practices

### 1. Strategic Placement

Place error boundaries at strategic points in your app:

```typescript
// App-level boundary
<ErrorBoundary fallback={<AppCrashScreen />}>
  <Router>
    {/* Route-level boundaries */}
    <ErrorBoundary>
      <Route path="/dashboard" component={Dashboard} />
    </ErrorBoundary>
    
    <ErrorBoundary>
      <Route path="/settings" component={Settings} />
    </ErrorBoundary>
  </Router>
</ErrorBoundary>
```

### 2. Logging and Monitoring

Always log errors to a monitoring service:

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Sentry, LogRocket, etc.
    errorMonitoringService.captureException(error, {
      extra: errorInfo
    });
  }}
>
  <App />
</ErrorBoundary>
```

### 3. User-Friendly Messages

Provide clear, actionable error messages:

```typescript
<ErrorBoundary
  fallback={(error, errorInfo, reset) => {
    return createErrorUI({
      title: "We're sorry, something went wrong",
      message: "Please try again or contact support if the problem persists.",
      action: reset,
      actionText: "Reload Page"
    });
  }}
>
  <App />
</ErrorBoundary>
```

### 4. Development vs Production

Show detailed errors in development, generic ones in production:

```typescript
const isDev = process.env.NODE_ENV === 'development';

<ErrorBoundary
  fallback={(error, errorInfo, reset) => {
    if (isDev) {
      return <DetailedErrorPage error={error} errorInfo={errorInfo} reset={reset} />;
    }
    return <GenericErrorPage reset={reset} />;
  }}
>
  <App />
</ErrorBoundary>
```

## Limitations

Error boundaries **do not** catch errors:
- In event handlers (use try-catch)
- In setTimeout/setInterval callbacks (use try-catch or captureError)
- In the error boundary component itself
- During server-side rendering

For these cases, use `captureError` or `useErrorHandler`.

## Example: Complete Setup

```typescript
import { 
  ErrorBoundary, 
  captureError, 
  state, 
  setState 
} from 'drift-spa';

// Error tracking service
const logError = (error: Error, errorInfo: any) => {
  console.error('Error:', error);
  console.error('Info:', errorInfo);
  // Send to Sentry, etc.
};

// App component
const App = () => {
  let resetKey = state(0);
  
  return (
    <ErrorBoundary
      resetKeys={[() => resetKey.value]}
      onError={logError}
      onReset={() => {
        console.log('App error boundary reset');
        // Clear error state
      }}
      fallback={(error, errorInfo, reset) => {
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>⚠️ Application Error</h1>
            <p>We're sorry, something unexpected happened.</p>
            <button onClick={reset}>Reload Application</button>
            <button onClick={() => setState(() => { resetKey.value++; })}>
              Force Reset
            </button>
          </div>
        );
      }}
    >
      <Router>
        <Routes />
      </Router>
    </ErrorBoundary>
  );
};

// Buggy component example
const BuggyComponent = () => {
  let count = state(0);
  
  // This will throw when count > 3
  if (count.value > 3) {
    throw new Error('Count is too high!');
  }
  
  return (
    <div>
      <p>Count: {() => count.value}</p>
      <button onClick={() => setState(() => { count.value++; })}>
        Increment
      </button>
    </div>
  );
};

// Async error example
const AsyncComponent = () => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('API Error');
      return response.json();
    } catch (error) {
      captureError(error, 'in AsyncComponent.fetchData');
    }
  };
  
  return <button onClick={fetchData}>Fetch Data</button>;
};
```

## API Reference

### `ErrorBoundary` Props

```typescript
interface ErrorBoundaryProps {
  children?: any;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => Node;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<() => any>;
}
```

### `captureError(error, context?)`

Manually capture an error and propagate it to the nearest error boundary.

```typescript
captureError(
  new Error('Something went wrong'),
  'in my async operation'
);
```

### `useErrorHandler()`

Returns an error handler function.

```typescript
const handleError = useErrorHandler();
handleError(error, 'optional context');
```

## Migration from React

Drift's Error Boundaries work similarly to React's, with a few differences:

### React:
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Drift:
```typescript
<ErrorBoundary
  fallback={(error, errorInfo, reset) => <ErrorFallback reset={reset} />}
  onError={logError}
>
  {children}
</ErrorBoundary>
```

Drift's approach is simpler and more functional!
