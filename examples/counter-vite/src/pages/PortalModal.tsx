import { state, setState, Portal, type FC } from 'drift-spa';

export const PortalModal: FC = () => {
  let showModal = state(false);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Modal Portal Example</h1>
      <p>Modal will render in document.body using Portal</p>
      
      <div style={{ 
        padding: '2rem', 
        background: '#f0f0f0', 
        overflow: 'hidden', 
        height: '200px',
        position: 'relative'
      }}>
        <p>Container with overflow: hidden</p>
        <button onClick={() => setState(() => { showModal.value = true; })}>
          Open Modal
        </button>
        <p style={{ color: '#666', fontSize: '14px' }}>
          The modal will NOT be clipped by this container's overflow!
        </p>
        
        {() => showModal.value && (
          <Portal>
            <div style={{ 
              position: 'fixed', 
              top: '0', 
              left: '0', 
              width: '100%', 
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '1000'
            }}>
              <div style={{ 
                background: 'white', 
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                maxWidth: '500px'
              }}>
                <h2>Portal Modal</h2>
                <p>This modal is rendered in document.body via Portal!</p>
                <p>It's not clipped by the parent's overflow: hidden.</p>
                <button 
                  onClick={() => setState(() => { showModal.value = false; })}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Close Modal
                </button>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
};

