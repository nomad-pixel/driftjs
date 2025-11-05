# Portals

Portals provide a way to render children into a DOM node that exists outside the parent component's hierarchy.

## Why Portals?

**Problem:** Parent containers with `overflow: hidden`, `z-index`, or positioning can clip or hide child elements like modals, tooltips, and dropdowns.

**Solution:** Render these elements in a different part of the DOM tree (usually `document.body`) while keeping them logically connected to their parent component.

## Basic Usage

### Portal Component

```typescript
import { Portal } from 'drift-spa';

const Modal = ({ children, onClose }) => {
  return (
    <Portal>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000 
      }}>
        <div style={{ background: 'white', padding: '2rem' }}>
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </Portal>
  );
};
```

### createPortal Function

```typescript
import { createPortal } from 'drift-spa';

const Modal = ({ children }) => {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
};
```

## Portal Target

### Default Target (document.body)

```typescript
<Portal>
  <Modal />
</Portal>
```

### Custom Element Target

```typescript
<Portal target={document.getElementById('modal-root')}>
  <Modal />
</Portal>
```

### String Selector Target

```typescript
<Portal target="#modal-root">
  <Modal />
</Portal>

<!-- In HTML -->
<div id="modal-root"></div>
```

## Real-World Examples

### 1. Modal Dialog

```typescript
import { Portal, state, setState } from 'drift-spa';

const ModalExample = () => {
  let showModal = state(false);
  
  return (
    <div>
      <button onClick={() => setState(() => { showModal.value = true; })}>
        Open Modal
      </button>
      
      {() => showModal.value && (
        <Portal>
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: 'white', 
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2>Modal Title</h2>
              <p>Modal content goes here</p>
              <button onClick={() => setState(() => { showModal.value = false; })}>
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};
```

### 2. Tooltip

```typescript
import { Portal, state, setState } from 'drift-spa';

const TooltipExample = () => {
  let showTooltip = state(false);
  let buttonRef = state<HTMLButtonElement | null>(null);
  
  return (
    <div>
      <button 
        ref={(el) => setState(() => { buttonRef.value = el as HTMLButtonElement; })}
        onMouseEnter={() => setState(() => { showTooltip.value = true; })}
        onMouseLeave={() => setState(() => { showTooltip.value = false; })}
      >
        Hover me
      </button>
      
      {() => showTooltip.value && buttonRef.value && (
        <Portal>
          <div style={() => {
            const rect = buttonRef.value?.getBoundingClientRect();
            return {
              position: 'fixed',
              top: `${(rect?.bottom || 0) + 8}px`,
              left: `${rect?.left || 0}px`,
              background: '#333',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: 9999,
              pointerEvents: 'none'
            };
          }}>
            This is a tooltip!
          </div>
        </Portal>
      )}
    </div>
  );
};
```

### 3. Toast Notifications

```typescript
import { Portal, state, setState } from 'drift-spa';

const NotificationSystem = () => {
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
    <div>
      <button onClick={() => addNotification('Success!')}>
        Show Notification
      </button>
      
      <Portal>
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 9999
        }}>
          {() => notifications.value.map(notif => (
            <div 
              key={notif.id}
              style={{ 
                background: '#2ecc71',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
```

### 4. Dropdown Menu

```typescript
import { Portal, state, setState } from 'drift-spa';

const DropdownExample = () => {
  let isOpen = state(false);
  let buttonRef = state<HTMLButtonElement | null>(null);
  
  return (
    <div>
      <button 
        ref={(el) => setState(() => { buttonRef.value = el as HTMLButtonElement; })}
        onClick={() => setState(() => { isOpen.value = !isOpen.value; })}
      >
        Open Dropdown
      </button>
      
      {() => isOpen.value && buttonRef.value && (
        <Portal>
          <div style={() => {
            const rect = buttonRef.value?.getBoundingClientRect();
            return {
              position: 'fixed',
              top: `${(rect?.bottom || 0) + 4}px`,
              left: `${rect?.left || 0}px`,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 1000
            };
          }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem' }}>
              <li style={{ padding: '0.5rem', cursor: 'pointer' }}>Option 1</li>
              <li style={{ padding: '0.5rem', cursor: 'pointer' }}>Option 2</li>
              <li style={{ padding: '0.5rem', cursor: 'pointer' }}>Option 3</li>
            </ul>
          </div>
        </Portal>
      )}
    </div>
  );
};
```

## Automatic Cleanup

Portals automatically clean up when unmounted:

```typescript
const Component = () => {
  let showModal = state(false);
  
  return (
    <div>
      <button onClick={() => setState(() => { showModal.value = !showModal.value; })}>
        Toggle Modal
      </button>
      
      {/* Portal and its content will be removed when showModal becomes false */}
      {() => showModal.value && (
        <Portal>
          <div>Modal content</div>
        </Portal>
      )}
    </div>
  );
};
```

## API Reference

### `<Portal>` Component

```typescript
interface PortalProps {
  children?: any;
  target?: Element | string;
}

<Portal target={document.body}>
  {children}
</Portal>
```

**Props:**
- `children` - Content to render in the portal
- `target` - Target DOM element or selector (defaults to `document.body`)
  - Can be an `Element` object
  - Can be a string selector (e.g., `"#modal-root"`)

### `createPortal()` Function

```typescript
function createPortal(
  children: Node | Node[], 
  target?: Element | string
): Node
```

**Parameters:**
- `children` - Content to render (Node or array of Nodes)
- `target` - Target DOM element or selector (defaults to `document.body`)

**Returns:**
- A comment node marker (placeholder in original position)

## Best Practices

### 1. Create Portal Roots

Add dedicated portal containers in your HTML:

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
  <div id="notification-root"></div>
</body>
</html>
```

### 2. Z-Index Management

Use consistent z-index layers:

```typescript
const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  TOOLTIP: 3000,
  NOTIFICATION: 4000,
};

<Portal>
  <div style={{ zIndex: Z_INDEX.MODAL }}>
    Modal content
  </div>
</Portal>
```

### 3. Accessibility

Add proper ARIA attributes:

```typescript
<Portal>
  <div 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <h2 id="modal-title">Modal Title</h2>
    <p>Content</p>
  </div>
</Portal>
```

### 4. Focus Management

Trap focus inside modals:

```typescript
const Modal = ({ onClose }) => {
  effect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  });
  
  return (
    <Portal>
      <div role="dialog" tabIndex={-1}>
        Modal content
      </div>
    </Portal>
  );
};
```

### 5. Click Outside to Close

```typescript
const Modal = ({ onClose }) => {
  return (
    <Portal>
      <div 
        style={{ position: 'fixed', inset: 0 }}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          Modal content (won't close when clicked)
        </div>
      </div>
    </Portal>
  );
};
```

## Comparison with Other Frameworks

### React

```jsx
// React
import { createPortal } from 'react-dom';

createPortal(<Modal />, document.body);
```

### Vue 3

```vue
<!-- Vue 3 -->
<Teleport to="body">
  <Modal />
</Teleport>
```

### Drift

```typescript
// Drift - Both APIs!
createPortal(<Modal />, document.body);
// or
<Portal target={document.body}>
  <Modal />
</Portal>
```

## Common Use Cases

✅ **Modal Dialogs** - Full-screen overlays  
✅ **Tooltips** - Positioned hints and help text  
✅ **Dropdown Menus** - Context menus and selects  
✅ **Toast Notifications** - Temporary messages  
✅ **Popovers** - Contextual information panels  
✅ **Lightboxes** - Image galleries  
✅ **Context Menus** - Right-click menus  
✅ **Date Pickers** - Calendar widgets  

## Limitations

❌ **Event Bubbling** - Events bubble to the portal parent in the React tree, not the DOM parent  
❌ **CSS Inheritance** - Styles don't inherit from the logical parent  
✅ **Context** - Drift Context API works across portals  
✅ **DI** - Drift Dependency Injection works across portals  

## Migration from React

Drift portals work almost identically to React:

```typescript
// React
import { createPortal } from 'react-dom';
const Modal = () => createPortal(<div>Modal</div>, document.body);

// Drift
import { createPortal } from 'drift-spa';
const Modal = () => createPortal(<div>Modal</div>, document.body);
```

No changes needed! 🎉

