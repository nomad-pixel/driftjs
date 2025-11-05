import { ErrorBoundary, type FC } from 'drift-spa';
import { BuggyComponent } from '../components/BuggyComponent';
import { AsyncErrorComponent } from '../components/AsyncErrorComponent';

export const NestedErrors: FC = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Nested Error Boundaries</h1>
      
      <ErrorBoundary>
        <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem' }}>
          <h2>Outer Boundary</h2>
          <p>This content is safe</p>
          
          <ErrorBoundary>
            <div style={{ background: '#e0e0e0', padding: '1rem' }}>
              <h3>Inner Boundary</h3>
              {BuggyComponent({})}
            </div>
          </ErrorBoundary>
          
          <p style={{ marginTop: '1rem' }}>This content is still visible even if inner component crashes</p>
        </div>
      </ErrorBoundary>
      
      <ErrorBoundary>
        {AsyncErrorComponent({})}
      </ErrorBoundary>
    </div>
  );
};

