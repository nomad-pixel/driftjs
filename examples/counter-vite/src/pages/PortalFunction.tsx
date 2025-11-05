import { state, setState, createPortal, type FC } from 'drift-spa';

export const PortalFunction: FC = () => {
  let showPortal = state(false);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>createPortal Function Example</h1>
      <p>Using createPortal() function directly (React-like API)</p>
      
      <button onClick={() => setState(() => { showPortal.value = !showPortal.value; })}>
        Toggle Portal
      </button>
      
      <div style={{ 
        marginTop: '1rem',
        padding: '1rem',
        background: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <p>Parent container</p>
        <div id="portal-target" style={{ 
          padding: '1rem', 
          background: '#e0e0e0',
          borderRadius: '4px',
          minHeight: '100px'
        }}>
          <p>Portal Target Container</p>
          {() => showPortal.value && createPortal(
            <div style={{ 
              padding: '1rem', 
              background: '#3498db', 
              color: 'white',
              borderRadius: '4px',
              marginTop: '0.5rem'
            }}>
              This content is rendered via createPortal()!
            </div>,
            '#portal-target'
          )}
        </div>
      </div>
    </div>
  );
};

