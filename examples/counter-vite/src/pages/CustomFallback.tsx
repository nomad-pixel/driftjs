import { ErrorBoundary, type FC } from 'drift-spa';
import { BuggyComponent } from '../components/BuggyComponent';

export const CustomFallback: FC = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Custom Fallback Example</h1>
      
      <ErrorBoundary
        fallback={(error, errorInfo, reset) => {
          const container = document.createElement('div');
          container.style.cssText = 'padding: 20px; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px;';
          
          const title = document.createElement('h3');
          title.textContent = '🚨 Custom Error UI';
          title.style.color = '#dc2626';
          
          const message = document.createElement('p');
          message.textContent = `Error: ${error.message}`;
          
          const button = document.createElement('button');
          button.textContent = 'Recover';
          button.style.cssText = 'padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;';
          button.onclick = reset;
          
          container.appendChild(title);
          container.appendChild(message);
          container.appendChild(button);
          
          return container;
        }}
      >
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  );
};

