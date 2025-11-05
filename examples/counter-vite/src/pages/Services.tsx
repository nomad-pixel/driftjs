import { inject, type FC } from 'drift-spa';
import { ThemeService } from '../services/theme.service';
import { LoggerService } from '../services/logger.service';
import { CounterService } from '../services/counter.service';

export const Services: FC = () => {
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
      <p>Логика полностью отделена в сервисах!</p>
      
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

