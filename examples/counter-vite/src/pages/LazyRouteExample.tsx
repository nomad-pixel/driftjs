import { type FC } from 'drift-spa';

export const LazyRouteExample: FC = () => {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 2rem; max-width: 800px; margin: 0 auto;';
  
  const title = document.createElement('h1');
  title.textContent = '⚡ Lazy Loading Routes Example';
  title.style.cssText = 'color: #1f2937; margin-bottom: 1rem;';
  
  const description = document.createElement('p');
  description.textContent = 'This page demonstrates lazy loading of route components for better performance and code splitting.';
  description.style.cssText = 'color: #6b7280; margin-bottom: 2rem;';
  
  const successBox = document.createElement('div');
  successBox.style.cssText = 'background: #dcfce7; border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;';
  successBox.innerHTML = `
    <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">✅ You're viewing a lazy-loaded page!</h3>
    <p style="margin: 0; color: #166534;">
      This component was loaded on-demand when you navigated here, not during the initial page load.
    </p>
  `;
  
  const benefits = document.createElement('div');
  benefits.style.cssText = 'background: #eff6ff; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;';
  benefits.innerHTML = `
    <h3 style="margin: 0 0 16px 0; color: #1e40af;">🚀 Benefits of Lazy Loading:</h3>
    <div style="display: grid; gap: 12px;">
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="flex-shrink: 0;">📦</span>
        <div>
          <strong style="color: #1e40af;">Smaller initial bundle</strong>
          <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 14px;">Only load code when needed</p>
        </div>
      </div>
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="flex-shrink: 0;">⚡</span>
        <div>
          <strong style="color: #1e40af;">Faster initial load</strong>
          <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 14px;">Less JavaScript to parse and execute</p>
        </div>
      </div>
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="flex-shrink: 0;">🔄</span>
        <div>
          <strong style="color: #1e40af;">Better caching</strong>
          <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 14px;">Components are cached after first load</p>
        </div>
      </div>
    </div>
  `;
  
  const code = document.createElement('pre');
  code.style.cssText = 'background: #1f2937; color: #f3f4f6; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 14px;';
  code.textContent = `// Define a lazy route:
const routes = {
  '/lazy': () => import('./pages/LazyRouteExample').then(m => ({ 
    default: m.LazyRouteExample 
  })),
  
  // Regular route for comparison:
  '/regular': RegularComponent
};

// Lazy routes are automatically:
// 1. Loaded only when navigated to
// 2. Cached after first load
// 3. Integrated with Suspense for loading states`;
  
  const tip = document.createElement('div');
  tip.style.cssText = 'background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 2rem;';
  tip.innerHTML = `
    <p style="margin: 0; color: #92400e;">
      💡 <strong>Tip:</strong> Check the Network tab in DevTools to see this component being loaded separately!
    </p>
  `;
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(successBox);
  container.appendChild(benefits);
  container.appendChild(code);
  container.appendChild(tip);
  
  return container;
};

