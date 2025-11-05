import { captureError, type FC } from 'drift-spa';

export const AsyncErrorComponent: FC = () => {
  const throwAsync = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Async operation failed!');
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Async Error Component</h2>
      <button onClick={() => {
        throwAsync().catch(error => {
          captureError(error, 'in async operation');
        });
      }}>
        Trigger Async Error
      </button>
    </div>
  );
};

