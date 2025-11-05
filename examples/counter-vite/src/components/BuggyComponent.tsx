import { state, setState, captureError, type FC } from 'drift-spa';

export const BuggyComponent: FC = () => {
  let count = state(0);
  
  const handleIncrement = () => {
    try {
      const newValue = count.value + 1;
      
      if (newValue > 3) {
        throw new Error(`Count is too high! (${newValue})`);
      }
      
      setState(() => { count.value = newValue; });
    } catch (error) {
      captureError(error as Error, 'BuggyComponent handleIncrement');
    }
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Buggy Component</h2>
      <p>Count: {() => count.value}</p>
      <p style={() => ({ color: count.value > 2 ? '#dc2626' : '#666' })}>
        This component will throw an error when count &gt; 3
      </p>
      <button onClick={handleIncrement}>
        Increment {() => count.value > 2 ? '(⚠️ will crash soon!)' : ''}
      </button>
    </div>
  );
};

