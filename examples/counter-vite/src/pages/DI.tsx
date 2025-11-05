import { state, setState, effect, createContext, provideContext, injectContext, type FC } from 'drift-spa';

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

export const DI: FC = () => {
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

