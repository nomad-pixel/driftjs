import { Suspense, lazy, state, setState, effect, type FC } from 'drift-spa';

// Lazy loaded component
const LazyHeavyComponent = lazy<{}>(async () => {
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    default: () => {
      const container = document.createElement('div');
      container.style.cssText = 'padding: 1rem; background: #e0f2fe; border-radius: 8px; margin-top: 1rem;';
      
      const title = document.createElement('h3');
      title.textContent = '✨ Heavy Component Loaded!';
      title.style.color = '#0369a1';
      
      const description = document.createElement('p');
      description.textContent = 'This component was loaded asynchronously using lazy() and Suspense.';
      description.style.color = '#075985';
      
      container.appendChild(title);
      container.appendChild(description);
      
      return container;
    }
  };
});

export const SuspenseLazyPage: FC = () => {
  let showLazy = state(false);
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem';
  
  const title = document.createElement('h1');
  title.textContent = 'Suspense + Lazy Loading Example';
  
  const description = document.createElement('p');
  description.textContent = 'Click the button to dynamically load a component with a 2-second delay.';
  description.style.color = '#666';
  
  const button = document.createElement('button');
  button.style.cssText = 'padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 1rem;';
  
  // Reactive text update
  effect(() => {
    button.textContent = showLazy.value ? 'Hide Component' : 'Load Heavy Component';
  });
  
  button.onclick = () => {
    setState(() => {
      showLazy.value = !showLazy.value;
    });
  };
  
  const suspenseContainer = document.createElement('div');
  
  const renderContent = () => {
    while (suspenseContainer.firstChild) {
      suspenseContainer.removeChild(suspenseContainer.firstChild);
    }
    
    if (showLazy.value) {
      const suspenseNode = Suspense({
        fallback: (() => {
          const loader = document.createElement('div');
          loader.style.cssText = 'padding: 2rem; text-align: center;';
          
          const spinner = document.createElement('div');
          spinner.textContent = '⏳ Loading component...';
          spinner.style.cssText = 'color: #3b82f6; font-size: 16px;';
          
          loader.appendChild(spinner);
          return loader;
        })(),
        children: LazyHeavyComponent({}),
        onResolve: () => {
          console.log('Lazy component loaded successfully!');
        }
      });
      
      suspenseContainer.appendChild(suspenseNode);
    }
  };
  
  renderContent();
  
  // Watch for changes
  let prevValue = showLazy.value;
  setInterval(() => {
    if (prevValue !== showLazy.value) {
      prevValue = showLazy.value;
      renderContent();
    }
  }, 100);
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(button);
  container.appendChild(suspenseContainer);
  
  return container;
};

