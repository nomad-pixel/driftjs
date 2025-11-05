import { state, setState, ErrorBoundary, type FC } from 'drift-spa';
import { BuggyComponent } from '../components/BuggyComponent';

export const ErrorBoundaryExample: FC = () => {
  let resetKey = state(0);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Error Boundary Example</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setState(() => { resetKey.value++; })}>
          Reset Error Boundary (key: {() => resetKey.value})
        </button>
      </div>
      
      <ErrorBoundary
        resetKeys={[() => resetKey.value]}
        onError={(error, errorInfo) => {
          console.log('ErrorBoundary caught error:', error);
          console.log('Error info:', errorInfo);
        }}
        onReset={() => {
          console.log('ErrorBoundary was reset');
        }}
      >
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  );
};

