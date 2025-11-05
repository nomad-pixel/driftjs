import { 
  computed, 
  state,
  setState,
  effect,
  untrack,
  createApp, 
  createRouter,
  createContext,
  provideContext,
  injectContext,
  createProvider,
  provide,
  inject,
  type FC, 
} from 'drift-spa';

import { ThemeService } from './services/theme.service';
import { LoggerService } from './services/logger.service';
import { CounterService } from './services/counter.service';
import { ApiService } from './services/api.service';

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

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

const ThemeContext = createContext<Theme>({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff',
  textColor: '#333333'
}, 'ThemeContext');

const ThemeButton: FC = () => {
  const theme = injectContext(ThemeContext);
  
  return (
    <button style={{ 
      background: theme.primaryColor, 
      color: '#fff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}>
      Themed Button
    </button>
  );
};

const ThemedCard: FC<{ title: string }> = (props) => {
  const theme = injectContext(ThemeContext);
  
  return (
    <div style={{ 
      background: theme.backgroundColor,
      color: theme.textColor,
      padding: '1rem',
      border: `2px solid ${theme.primaryColor}`,
      borderRadius: '8px',
      marginTop: '1rem'
    }}>
      <h3 style={{ color: theme.primaryColor }}>{props.title}</h3>
      <p>This card uses the theme from context</p>
      <ThemeButton />
    </div>
  );
};

const ContextExample: FC = () => {
  let currentTheme = state<'light' | 'dark'>('light');
  
  const theme = computed(() => {
    if (currentTheme.value === 'light') {
      return {
        primaryColor: '#3498db',
        backgroundColor: '#ffffff',
        textColor: '#333333'
      };
    } else {
      return {
        primaryColor: '#e74c3c',
        backgroundColor: '#2c3e50',
        textColor: '#ecf0f1'
      };
    }
  });
  
  effect(() => {
    const themeValue = theme();
    provideContext(ThemeContext, themeValue);
  }, [theme]);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Context API Example</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => {
          setState(() => {
            currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
          });
        }}>
          Toggle Theme (Current: {() => currentTheme.value})
        </button>
      </div>
      
      {() => {
        provideContext(ThemeContext, theme());
        return [
          <ThemedCard title="Card 1" />,
          <ThemedCard title="Card 2" />
        ];
      }}
    </div>
  );
};

type User = {
  id: number;
  name: string;
  email: string;
};

const UserContext = createContext<User | null>(null, 'UserContext');

const UserProfile: FC = () => {
  const user = injectContext(UserContext);
  
  if (!user) {
    return <p>No user logged in</p>;
  }
  
  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
      <h3>User Profile</h3>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

const UserGreeting: FC = () => {
  const user = injectContext(UserContext);
  
  if (!user) {
    return <p>Welcome, Guest!</p>;
  }
  
  return <p>Welcome, {user.name}!</p>;
};

const NestedContextExample: FC = () => {
  let user = state<User | null>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Nested Context Example</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => {
          setState(() => {
            if (user.value) {
              user.value = null;
            } else {
              user.value = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com'
              };
            }
          });
        }}>
          {() => user.value ? 'Logout' : 'Login'}
        </button>
      </div>
      
      {() => {
        provideContext(UserContext, user.value);
        return [
          <UserGreeting />,
          <div style={{ marginTop: '1rem' }}>
            <UserProfile />
          </div>
        ];
      }}
    </div>
  );
};

type Logger = {
  log: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const LoggerContext = createContext<Logger>({
  log: (msg) => console.log('[Default]', msg),
  error: (msg) => console.error('[Default]', msg),
  info: (msg) => console.info('[Default]', msg)
}, 'LoggerContext');

const ComponentWithLogger: FC<{ name: string }> = (props) => {
  const logger = injectContext(LoggerContext);
  
  effect(() => {
    logger.info(`Component ${props.name} mounted`);
    return () => {
      logger.info(`Component ${props.name} unmounted`);
    };
  }, []);
  
  return (
    <div style={{ padding: '1rem', background: '#e8f5e9', marginTop: '0.5rem', borderRadius: '4px' }}>
      <p>Component: {props.name}</p>
      <button onClick={() => logger.log(`Button clicked in ${props.name}`)}>
        Log Message
      </button>
    </div>
  );
};

const DIExample: FC = () => {
  let logs = state<string[]>([]);
  
  const logger: Logger = {
    log: (msg) => {
      console.log(msg);
      setState(() => {
        logs.value = [...logs.value, `[LOG] ${msg}`];
      });
    },
    error: (msg) => {
      console.error(msg);
      setState(() => {
        logs.value = [...logs.value, `[ERROR] ${msg}`];
      });
    },
    info: (msg) => {
      console.info(msg);
      setState(() => {
        logs.value = [...logs.value, `[INFO] ${msg}`];
      });
    }
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dependency Injection Example</h1>
      <p>Custom Logger Service via Context</p>
      
      {() => {
        provideContext(LoggerContext, logger);
        return [
          <ComponentWithLogger name="Component A" />,
          <ComponentWithLogger name="Component B" />
        ];
      }}
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Logs:</h3>
        <div style={{ 
          maxHeight: '150px', 
          overflow: 'auto', 
          background: '#f5f5f5', 
          padding: '0.5rem',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {() => logs.value.length > 0 ? logs.value.join('\n') : 'No logs yet'}
        </div>
        <button onClick={() => setState(() => { logs.value = []; })} style={{ marginTop: '0.5rem' }}>
          Clear Logs
        </button>
      </div>
    </div>
  );
};

const DIServiceExample: FC = () => {
  const theme = inject(ThemeService);
  const logger = inject(LoggerService);
  const counter = inject(CounterService);
  
  return (
    <div style={() => ({ 
      padding: '1rem',
      background: theme.theme().backgroundColor,
      color: theme.theme().textColor,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    })}>
      <h1>Service DI Example</h1>
      <p>Логика полностью отдел ена в сервисах!</p>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={() => ({ 
          flex: '1', 
          minWidth: '250px',
          background: theme.isDark.value ? '#34495e' : '#ecf0f1',
          padding: '1rem',
          borderRadius: '8px'
        })}>
          <h2>Theme Service</h2>
          <p>Current: {() => theme.isDark.value ? 'Dark' : 'Light'}</p>
          <button 
            onClick={() => theme.toggle()}
            style={() => ({
              background: theme.theme().primaryColor,
              color: '#fff',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            })}
          >
            Toggle Theme
          </button>
        </div>
        
        <div style={() => ({ 
          flex: '1', 
          minWidth: '250px',
          background: theme.isDark.value ? '#34495e' : '#ecf0f1',
          padding: '1rem',
          borderRadius: '8px'
        })}>
          <h2>Counter Service</h2>
          <p>Count: {() => counter.count.value}</p>
          <p>Double: {() => counter.double()}</p>
          <p>Step: {() => counter.step.value}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => counter.increment()}>+</button>
            <button onClick={() => counter.decrement()}>-</button>
            <button onClick={() => counter.reset()}>Reset</button>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Step: </label>
            <input 
              type="number" 
              value={counter.step.value}
              onInput={(e) => counter.setStep(Number((e.target as HTMLInputElement).value))}
              style={{ width: '60px' }}
            />
          </div>
        </div>
      </div>
      
      <div style={() => ({ 
        marginTop: '1rem',
        background: theme.isDark.value ? '#34495e' : '#ecf0f1',
        padding: '1rem',
        borderRadius: '8px'
      })}>
        <h2>Logger Service</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => logger.info('Info message')}>Log Info</button>
          <button onClick={() => logger.warn('Warning message')}>Log Warn</button>
          <button onClick={() => logger.error('Error message')}>Log Error</button>
          <button onClick={() => logger.clear()}>Clear</button>
        </div>
        <div style={{ 
          maxHeight: '200px', 
          overflow: 'auto', 
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '0.5rem',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {() => logger.logs.value.map(log => (
            <div style={{ 
              color: log.level === 'error' ? '#f48771' : 
                     log.level === 'warn' ? '#dcdcaa' :
                     log.level === 'info' ? '#4fc1ff' : '#d4d4d4'
            }}>
              [{log.timestamp.toLocaleTimeString()}] {log.level.toUpperCase()}: {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ApiServiceExample: FC = () => {
  const api = inject(ApiService);
  const logger = inject(LoggerService);
  
  let userId = state(1);
  let loading = state(false);
  let user = state<any>(null);
  
  const fetchUser = async () => {
    setState(() => { loading.value = true; });
    try {
      const data = await api.fetchUser(userId.value);
      setState(() => { user.value = data; });
      logger.info(`Loaded user: ${data.name}`);
    } catch (err) {
      logger.error('Failed to load user');
    } finally {
      setState(() => { loading.value = false; });
    }
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>API Service Example</h1>
      <p>ApiService инжектится автоматически</p>
      
      <div style={{ marginTop: '1rem' }}>
        <label>User ID: </label>
        <input 
          type="number" 
          value={userId.value}
          onInput={(e) => setState(() => { userId.value = Number((e.target as HTMLInputElement).value); })}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={fetchUser}>Fetch User</button>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        {() => loading.value ? (
          <p>Loading...</p>
        ) : user.value ? (
          <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
            <h3>{user.value.name}</h3>
            <p>Email: {user.value.email}</p>
            <p>ID: {user.value.id}</p>
          </div>
        ) : (
          <p>Click "Fetch User" to load data</p>
        )}
      </div>
    </div>
  );
};

provide(LoggerService);
provide(ThemeService);
provide(ApiService);
provide(CounterService, { deps: [LoggerService] });

const { RouterView, push } = createRouter({
  mode: 'history',
  routes: {
    '/': SimpleCounter,
    '/async': AsyncComputedExample,
    '/advanced-effect': AdvancedEffectExample,
    '/context': ContextExample,
    '/nested-context': NestedContextExample,
    '/di': DIExample,
    '/services': DIServiceExample,
    '/api-service': ApiServiceExample,
    '/test': TestPage,
    '*': () => <div>404</div>
  }
});

const App: FC = () => (
  <div>
    <nav style={{ padding: '1rem', background: '#f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <a href="/" onClick={(e) => { e.preventDefault(); push('/'); }}>Home</a>
      <a href="/async" onClick={(e) => { e.preventDefault(); push('/async'); }}>Async</a>
      <a href="/advanced-effect" onClick={(e) => { e.preventDefault(); push('/advanced-effect'); }}>Effects</a>
      <a href="/context" onClick={(e) => { e.preventDefault(); push('/context'); }}>Context</a>
      <a href="/nested-context" onClick={(e) => { e.preventDefault(); push('/nested-context'); }}>Nested</a>
      <a href="/di" onClick={(e) => { e.preventDefault(); push('/di'); }}>DI Old</a>
      <a href="/services" onClick={(e) => { e.preventDefault(); push('/services'); }}>Services</a>
      <a href="/api-service" onClick={(e) => { e.preventDefault(); push('/api-service'); }}>API</a>
      <a href="/test" onClick={(e) => { e.preventDefault(); push('/test'); }}>Test</a>
    </nav>
    <RouterView />
  </div>
);

createApp(App).mount('#app');