import { 
  createSignal, 
  createComputed, 
  createApp, 
  createHashRouter, 
  type FC 
} from '@drift/runtime';

const SimpleCounter: FC = () => {
  const [count, setCount] = createSignal(0);
  const doubleCount = createComputed(() => count() * 2);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Простой тест Drift</h1>
      <p>Count: {() => count()}</p>
      <p>Double: {() => doubleCount()}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

const TestPage: FC = () => (
  <div style={{ padding: '1rem' }}>
    <h2>Тестовая страница</h2>
    <p>Это простая тестовая страница</p>
  </div>
);

const { RouterView, push } = createHashRouter({
  '/': SimpleCounter,
  '/test': TestPage,
  '*': () => <div>404</div>
});

const App: FC = () => (
  <div>
    <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
      <a href="#/" style={{ marginRight: '1rem' }}>Home</a>
      <a href="#/test" style={{ marginRight: '1rem' }}>Test</a>
      <button onClick={() => push('/test')}>Go to Test</button>
    </nav>
    <RouterView />
  </div>
);

createApp(App).mount('#app');
