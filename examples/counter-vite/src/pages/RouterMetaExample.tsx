import { type FC } from 'drift-spa';

export const RouterMetaExample: FC = () => {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 2rem; max-width: 800px; margin: 0 auto;';
  
  const title = document.createElement('h1');
  title.textContent = '🎯 Route Metadata Example';
  title.style.cssText = 'color: #1f2937; margin-bottom: 1rem;';
  
  const description = document.createElement('p');
  description.textContent = 'This page demonstrates automatic SEO metadata management. Check the browser tab title and view page source to see meta tags!';
  description.style.cssText = 'color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 2rem;';
  
  const infoBox = document.createElement('div');
  infoBox.style.cssText = 'background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;';
  infoBox.innerHTML = `
    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px;">✨ Features Demonstrated:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
      <li>Automatic document.title update</li>
      <li>Meta description tag injection</li>
      <li>Custom meta tags (keywords, author)</li>
      <li>SEO-friendly routing</li>
    </ul>
  `;
  
  const code = document.createElement('pre');
  code.style.cssText = 'background: #1f2937; color: #f3f4f6; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 14px;';
  code.textContent = `// Route configuration with metadata:
{
  '/router-meta': {
    component: RouterMetaExample,
    meta: {
      title: 'Route Metadata | Drift SPA',
      description: 'Example of automatic SEO metadata',
      meta: {
        keywords: 'drift, spa, routing, seo, metadata',
        author: 'Drift Team'
      }
    }
  }
}`;
  
  const checkInstructions = document.createElement('div');
  checkInstructions.style.cssText = 'background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 1rem;';
  checkInstructions.innerHTML = `
    <p style="margin: 0; color: #92400e; font-weight: 600;">
      🔍 How to verify:
    </p>
    <ol style="margin: 8px 0 0 20px; padding: 0; color: #92400e;">
      <li>Check the browser tab title above</li>
      <li>Open DevTools → Elements → &lt;head&gt;</li>
      <li>Look for &lt;meta name="description"&gt; and other tags</li>
    </ol>
  `;
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(infoBox);
  container.appendChild(code);
  container.appendChild(checkInstructions);
  
  return container;
};

