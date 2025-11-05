import { state, setState, Portal, type FC } from 'drift-spa';

export const PortalNotifications: FC = () => {
  let notifications = state<Array<{ id: number; message: string }>>([]);
  let nextId = 0;
  
  const addNotification = (message: string) => {
    const id = nextId++;
    setState(() => {
      notifications.value = [...notifications.value, { id, message }];
    });
    
    setTimeout(() => {
      setState(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      });
    }, 3000);
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Notification Portal Example</h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => addNotification('Success! ✅')}>
          Show Success
        </button>
        <button onClick={() => addNotification('Warning! ⚠️')}>
          Show Warning
        </button>
        <button onClick={() => addNotification('Error! ❌')}>
          Show Error
        </button>
      </div>
      
      <p>Notifications will appear in top-right corner via Portal</p>
      
      <Portal>
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: '9999'
        }}>
          {() => notifications.value.map(notif => (
            <div 
              style={{ 
                background: '#2ecc71',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                minWidth: '200px',
                animation: 'slideIn 0.3s ease'
              }}
            >
              {notif.message}
            </div>
          ))}
        </div>
      </Portal>
    </div>
  );
};

