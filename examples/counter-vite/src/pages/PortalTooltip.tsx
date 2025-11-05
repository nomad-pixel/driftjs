import { state, setState, Portal, type FC } from 'drift-spa';

export const PortalTooltip: FC = () => {
  let showTooltip = state(false);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Tooltip Portal Example</h1>
      
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <button 
          onMouseEnter={() => setState(() => { showTooltip.value = true; })}
          onMouseLeave={() => setState(() => { showTooltip.value = false; })}
          style={{
            padding: '0.5rem 1rem',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hover me for tooltip
        </button>
        
        {() => showTooltip.value && (
          <Portal>
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#333',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: '9999',
              pointerEvents: 'none'
            }}>
              This is a tooltip rendered via Portal!
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
};

