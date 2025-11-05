import { 
  computed, 
  state,
  setState,
  effect,
  untrack,
  createApp, 
  createRouter, 
  type FC, 
} from 'drift-spa';

const SimpleCounter: FC = () => {
  let count = state(0);
  const doubleCount = computed(() => count.value * 2);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Drift Simple Test</h1>
      <p>Count: {() => count.value}</p>
      <p>Double: {() => doubleCount()}</p>
      <button onClick={() => {
        setState(() => {
          count.value = count.value + 1;
        });
      }}>+</button>
      <button onClick={() => {
        setState(() => {
          count.value = 0;
        });
      }}>Reset</button>
    </div>
  );
};

const AsyncComputedExample: FC = () => {
  let userId = state(1);
  
  const userData = computed(async () => {
    const currentId = userId.value;
    console.log('Computed function executing, userId.value:', currentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    const finalId = userId.value;
    console.log('Computed function after await, userId.value:', finalId);
    return {
      id: finalId,
      name: `User ${finalId}`,
      email: `user${finalId}@example.com`
    };
  });
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Async Computed Example</h1>
      <p>User ID: {() => userId.value}</p>
      <div style={{ marginTop: '1rem' }}>
        {() => {
          const data = userData();
          if (!data) {
            return <p>Loading...</p>;
          }
          return [
            <p>Name: {data.name}</p>,
            <p>Email: {data.email}</p>
          ];
        }}
      </div>
      <button onClick={() => {
        setState(() => {
          userId.value = userId.value + 1;
        });
      }}>Next User</button>
    </div>
  );
};

const AdvancedEffectExample: FC = () => {
  let count = state(0);
  let logs = state<string[]>([]);
  console.log('AdvancedEffectExample rendered');
  effect(() => {
    if (count.value > 0) {
      const snapshot = untrack(() => logs.value);
      logs.value = [...snapshot, `Count changed to: ${count.value}`];
    }
  }, [count]);
  
  effect(() => {
    const interval = setInterval(() => {
      console.log('Background tick:', count.value);
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  effect(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const snapshot = untrack(() => logs.value);
    logs.value = [...snapshot, 'Async effect completed'];
  }, []);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Advanced Effect Example</h1>
      <p>Count: {() => count.value}</p>
      <button onClick={() => {
        setState(() => {
          count.value++;
        });
      }}>Increment</button>
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Logs:</h3>
        <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '0.55rem', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          {() => logs.value.join('\n')}
        </div>
      </div>
    </div>
  );
};

const TestPage: FC = () => (
  <div style={{ padding: '1rem' }}>
    <h2>Test Page</h2>
    <p>This is a simple test page</p>
  </div>
);

const { RouterView, push } = createRouter({
  mode: 'history',
  routes: {
    '/': SimpleCounter,
    '/async': AsyncComputedExample,
    '/advanced-effect': AdvancedEffectExample,
    '/test': TestPage,
    '*': () => <div>404</div>
  }
});

const App: FC = () => (
  <div>
    <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
      <a href="/" onClick={(e) => { e.preventDefault(); push('/'); }} style={{ marginRight: '1rem' }}>Home</a>
      <a href="/async" onClick={(e) => { e.preventDefault(); push('/async'); }} style={{ marginRight: '1rem' }}>Async Computed</a>
      <a href="/advanced-effect" onClick={(e) => { e.preventDefault(); push('/advanced-effect'); }} style={{ marginRight: '1rem' }}>Advanced Effect</a>
      <a href="/test" onClick={(e) => { e.preventDefault(); push('/test'); }} style={{ marginRight: '1rem' }}>Test</a>
    </nav>
    <RouterView />
  </div>
);

createApp(App).mount('#app');