# Suspense

Suspense provides a declarative way to handle asynchronous operations in your Drift application, showing fallback UI while content is loading.

## Overview

Suspense automatically coordinates loading states for:
- Lazy-loaded components (`lazy()`)
- Async data fetching (`createResource()`)
- Async computed values
- Manual promises (`useSuspensePromise()`)

## Basic Usage

Wrap async content with `<Suspense>`:

```typescript
import { Suspense } from 'drift-spa';

<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## API Reference

### `<Suspense>`

Container component that catches promises and shows fallback UI while loading.

```typescript
interface SuspenseProps {
  children?: any;
  fallback?: Child;  // UI to show while loading
  onResolve?: () => void;  // Called when all promises resolve
  onError?: (error: Error) => void;  // Called on error
}
```

**Example:**

```typescript
<Suspense
  fallback={<LoadingSpinner />}
  onResolve={() => console.log('Content loaded!')}
  onError={(error) => console.error('Failed:', error)}
>
  <YourAsyncComponent />
</Suspense>
```

---

### `lazy(loader)`

Creates a lazy-loaded component that splits into a separate bundle.

```typescript
function lazy<P = {}>(
  loader: () => Promise<{ default: (props: P) => Node }>
): (props: P) => Node
```

**Example:**

```typescript
import { lazy, Suspense } from 'drift-spa';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading component...</div>}>
  <HeavyComponent />
</Suspense>
```

---

### `createResource(fetcher)`

Creates a resource that fetches data and integrates with Suspense.

```typescript
function createResource<T>(
  fetcher: () => Promise<T>
): () => T | undefined
```

**Example:**

```typescript
import { createResource, Suspense } from 'drift-spa';

const UserProfile = (props: { userId: number }) => {
  const userResource = createResource(() => 
    fetch(`/api/users/${props.userId}`).then(r => r.json())
  );
  
  const user = userResource();
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </div>
  );
};

<Suspense fallback={<div>Loading user...</div>}>
  <UserProfile userId={1} />
</Suspense>
```

---

### `useSuspensePromise(promise)`

Manually register a promise with the current Suspense boundary.

```typescript
function useSuspensePromise<T>(promise: Promise<T>): void
```

**Example:**

```typescript
const MyComponent = () => {
  const loadData = async () => {
    const promise = fetch('/api/data').then(r => r.json());
    useSuspensePromise(promise);
    const data = await promise;
    // ... use data
  };
  
  return <button onClick={loadData}>Load</button>;
};
```

---

### `SuspenseList`

Container for coordinating multiple Suspense boundaries (experimental).

```typescript
<SuspenseList
  revealOrder="forwards"  // or "backwards", "together"
  tail="collapsed"  // or "hidden"
>
  <Suspense fallback={<Skeleton1 />}>
    <Content1 />
  </Suspense>
  <Suspense fallback={<Skeleton2 />}>
    <Content2 />
  </Suspense>
</SuspenseList>
```

---

## Examples

### 1. Lazy Loading Components

```typescript
import { lazy, Suspense } from 'drift-spa';

// Create lazy component
const Dashboard = lazy(async () => {
  // This module will be code-split
  const module = await import('./Dashboard');
  return { default: module.Dashboard };
});

// Use with Suspense
const App = () => (
  <Suspense fallback={<div>Loading dashboard...</div>}>
    <Dashboard />
  </Suspense>
);
```

---

### 2. Data Fetching

```typescript
import { createResource, Suspense, state, setState } from 'drift-spa';

interface Post {
  id: number;
  title: string;
  body: string;
}

const fetchPost = async (id: number): Promise<Post> => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return response.json();
};

const PostView = (props: { postId: number }) => {
  const postResource = createResource(() => fetchPost(props.postId));
  const post = postResource();
  
  return (
    <div>
      <h2>{post?.title}</h2>
      <p>{post?.body}</p>
    </div>
  );
};

const App = () => {
  let postId = state(1);
  
  return (
    <div>
      <button onClick={() => setState(() => { postId.value++; })}>
        Next Post
      </button>
      
      <Suspense fallback={<div>Loading post...</div>}>
        <PostView postId={postId.value} />
      </Suspense>
    </div>
  );
};
```

---

### 3. Nested Suspense Boundaries

```typescript
import { Suspense, createResource } from 'drift-spa';

const Profile = () => {
  const user = createResource(() => fetchUser())();
  return <div>{user?.name}</div>;
};

const Posts = () => {
  const posts = createResource(() => fetchPosts())();
  return <div>{posts?.length} posts</div>;
};

const Comments = () => {
  const comments = createResource(() => fetchComments())();
  return <div>{comments?.length} comments</div>;
};

const App = () => (
  <div>
    {/* Each section loads independently */}
    <Suspense fallback={<div>Loading profile...</div>}>
      <Profile />
    </Suspense>
    
    <Suspense fallback={<div>Loading posts...</div>}>
      <Posts />
    </Suspense>
    
    <Suspense fallback={<div>Loading comments...</div>}>
      <Comments />
    </Suspense>
  </div>
);
```

---

### 4. With Async Computed

Async `computed` values automatically work with Suspense:

```typescript
import { computed, Suspense } from 'drift-spa';

const DataComponent = () => {
  const asyncData = computed(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
  
  return <div>{asyncData()?.value}</div>;
};

<Suspense fallback={<div>Loading...</div>}>
  <DataComponent />
</Suspense>
```

---

### 5. Custom Fallback UI

```typescript
const CustomLoader = () => {
  const loader = document.createElement('div');
  loader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  `;
  
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  loader.appendChild(spinner);
  return loader;
};

<Suspense fallback={CustomLoader()}>
  <AsyncContent />
</Suspense>
```

---

### 6. Error Handling

```typescript
<Suspense
  fallback={<div>Loading...</div>}
  onError={(error) => {
    console.error('Failed to load:', error);
    // Send to error tracking service
    errorTracker.captureException(error);
  }}
  onResolve={() => {
    console.log('Content loaded successfully');
  }}
>
  <AsyncContent />
</Suspense>
```

---

### 7. Parallel Loading

```typescript
const ParallelData = () => {
  // All resources start loading immediately
  const user = createResource(() => fetchUser())();
  const posts = createResource(() => fetchPosts())();
  const comments = createResource(() => fetchComments())();
  
  return (
    <div>
      <div>User: {user?.name}</div>
      <div>Posts: {posts?.length}</div>
      <div>Comments: {comments?.length}</div>
    </div>
  );
};

<Suspense fallback={<div>Loading all data...</div>}>
  <ParallelData />
</Suspense>
```

---

## How It Works

1. **Promise Detection**: When a `lazy()` component, `createResource()`, or async `computed` returns a promise, it registers with the nearest Suspense boundary.

2. **Fallback Rendering**: While promises are pending, Suspense shows the fallback UI.

3. **Resolution**: Once all promises resolve, Suspense renders the children.

4. **Error Handling**: If any promise rejects, the `onError` callback is triggered.

---

## Best Practices

### 1. Strategic Boundaries

Place Suspense boundaries at strategic points:

```typescript
// ✅ Good - granular loading states
<div>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>
  
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
  
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</div>

// ❌ Bad - single loading state for everything
<Suspense fallback={<AppSkeleton />}>
  <Header />
  <MainContent />
  <Sidebar />
</Suspense>
```

### 2. Meaningful Fallbacks

Provide context-aware loading states:

```typescript
// ✅ Good - specific message
<Suspense fallback={<div>Loading user profile...</div>}>
  <UserProfile />
</Suspense>

// ❌ Bad - generic message
<Suspense fallback={<div>Loading...</div>}>
  <UserProfile />
</Suspense>
```

### 3. Skeleton Screens

Use skeleton screens for better UX:

```typescript
const UserProfileSkeleton = () => {
  const skeleton = document.createElement('div');
  skeleton.innerHTML = `
    <div class="skeleton-header"></div>
    <div class="skeleton-avatar"></div>
    <div class="skeleton-text"></div>
  `;
  return skeleton;
};

<Suspense fallback={<UserProfileSkeleton />}>
  <UserProfile />
</Suspense>
```

### 4. Error Boundaries

Combine with ErrorBoundary for comprehensive error handling:

```typescript
<ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
  <Suspense fallback={<Loading />}>
    <AsyncContent />
  </Suspense>
</ErrorBoundary>
```

### 5. Code Splitting

Use `lazy()` for route-level code splitting:

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

const App = () => {
  const { RouterView } = createRouter({
    routes: {
      '/dashboard': () => (
        <Suspense fallback={<PageLoader />}>
          <Dashboard />
        </Suspense>
      ),
      '/profile': () => (
        <Suspense fallback={<PageLoader />}>
          <Profile />
        </Suspense>
      )
    }
  });
  
  return <RouterView />;
};
```

---

## Integration with Other APIs

### With Error Boundaries

```typescript
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

### With Portals

```typescript
<Portal target={document.body}>
  <Suspense fallback={<ModalLoader />}>
    <AsyncModal />
  </Suspense>
</Portal>
```

### With DI

```typescript
const DataComponent = () => {
  const api = inject(ApiService);
  
  const data = createResource(() => api.fetchData())();
  
  return <div>{data?.value}</div>;
};

<Suspense fallback={<Loading />}>
  <DataComponent />
</Suspense>
```

---

## Default Fallback

If no fallback is provided, Suspense shows a default spinner:

```typescript
// Uses default loading spinner
<Suspense>
  <AsyncContent />
</Suspense>
```

The default fallback is a CSS-animated blue spinner.

---

## Limitations

Suspense works best for:
- ✅ Component-level async operations
- ✅ Data fetching on mount
- ✅ Lazy component loading

It's not designed for:
- ❌ Event handler async operations (use loading states)
- ❌ User-triggered mutations (use loading states)
- ❌ Polling/subscriptions (use effects)

For those cases, manage loading state manually:

```typescript
const MyComponent = () => {
  let loading = state(false);
  let data = state(null);
  
  const fetchData = async () => {
    setState(() => { loading.value = true; });
    try {
      const result = await api.fetchData();
      setState(() => { data.value = result; });
    } finally {
      setState(() => { loading.value = false; });
    }
  };
  
  return (
    <div>
      <button onClick={fetchData}>Load Data</button>
      {() => loading.value ? <Loading /> : <DataDisplay data={data.value} />}
    </div>
  );
};
```

---

## Migration from Other Frameworks

### From React

React Suspense:
```jsx
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

Drift Suspense:
```typescript
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

Very similar! Main difference: Drift uses `createResource()` instead of special libraries.

### From Vue

Vue async setup:
```vue
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
```

Drift Suspense:
```typescript
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

---

## Performance Tips

1. **Preload Resources**: Start fetching early
```typescript
// Preload before rendering
const userResource = createResource(() => fetchUser());

// Later in component
<Suspense>
  {/* Resource already started loading */}
</Suspense>
```

2. **Parallel Fetching**: Fetch multiple resources in parallel
```typescript
const user = createResource(() => fetchUser())();
const posts = createResource(() => fetchPosts())(); // Parallel!
```

3. **Route-level Code Splitting**: Split large pages
```typescript
const Dashboard = lazy(() => import('./Dashboard'));
```

4. **Avoid Over-Suspending**: Don't wrap small sync components
```typescript
// ❌ Bad - unnecessary
<Suspense>
  <StaticHeader />
</Suspense>

// ✅ Good - only async content
<StaticHeader />
<Suspense>
  <AsyncContent />
</Suspense>
```

---

## Troubleshooting

### Suspense shows fallback forever

**Problem**: Fallback never resolves

**Solutions**:
- Ensure promises actually resolve
- Check for errors in `onError`
- Verify `createResource` is called inside Suspense boundary

### Flickering loading states

**Problem**: Fallback appears briefly then disappears

**Solutions**:
- Use minimum delay for fallbacks
- Cache data when appropriate
- Consider showing cached data while revalidating

### Multiple re-renders

**Problem**: Component renders multiple times

**Solutions**:
- Ensure resources are created outside render function
- Use memoization for expensive operations
- Check for unnecessary state updates

---

## See Also

- [Error Boundaries](./ERROR_BOUNDARIES.md) - Error handling
- [Portals](./PORTALS.md) - Rendering outside hierarchy
- [Context API](./CONTEXT_API.md) - Sharing data
- [Dependency Injection](./DEPENDENCY_INJECTION.md) - Service management

