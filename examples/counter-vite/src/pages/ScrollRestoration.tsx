import { type FC } from 'drift-spa';

export const ScrollRestoration: FC = () => {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 2rem; max-width: 800px; margin: 0 auto;';
  
  const title = document.createElement('h1');
  title.textContent = '📜 Scroll Restoration Example';
  title.style.cssText = 'color: #1f2937; margin-bottom: 1rem;';
  
  const instructions = document.createElement('div');
  instructions.style.cssText = 'background: #dcfce7; border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;';
  instructions.innerHTML = `
    <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">📝 How to test:</h3>
    <ol style="margin: 0; padding-left: 20px; color: #166534;">
      <li>Scroll down this page (there's lots of content below)</li>
      <li>Navigate to another page using the nav bar</li>
      <li>Use browser's back button to return here</li>
      <li>Your scroll position will be restored! ✨</li>
    </ol>
  `;
  
  container.appendChild(title);
  container.appendChild(instructions);
  
  for (let i = 1; i <= 20; i++) {
    const section = document.createElement('div');
    section.style.cssText = 'margin: 2rem 0; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;';
    
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = `Section ${i}`;
    sectionTitle.style.cssText = 'margin: 0 0 12px 0;';
    
    const sectionContent = document.createElement('p');
    sectionContent.textContent = `This is section ${i}. Scroll down to see more sections and test the scroll restoration feature. The router automatically saves your scroll position when you navigate away and restores it when you come back!`;
    sectionContent.style.cssText = 'margin: 0; line-height: 1.6; opacity: 0.9;';
    
    section.appendChild(sectionTitle);
    section.appendChild(sectionContent);
    container.appendChild(section);
  }
  
  const footer = document.createElement('div');
  footer.style.cssText = 'background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; text-align: center;';
  footer.innerHTML = `
    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 18px;">
      🎉 You've reached the bottom!
    </p>
    <p style="margin: 8px 0 0 0; color: #92400e;">
      Navigate away and come back using the browser back button to see scroll restoration in action.
    </p>
  `;
  
  container.appendChild(footer);
  
  return container;
};

