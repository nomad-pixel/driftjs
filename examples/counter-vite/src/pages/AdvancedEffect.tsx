import { state, setState, effect, untrack, type FC } from 'drift-spa';

export const AdvancedEffect: FC = () => {
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

