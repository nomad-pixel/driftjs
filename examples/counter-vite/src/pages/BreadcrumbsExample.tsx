import { state, setState, type FC } from 'drift-spa';

export const BreadcrumbsExample: FC<{ router: any }> = (props) => {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 2rem; max-width: 800px; margin: 0 auto;';
  
  const title = document.createElement('h1');
  title.textContent = '🍞 Breadcrumbs API Example';
  title.style.cssText = 'color: #1f2937; margin-bottom: 1rem;';
  
  const description = document.createElement('p');
  description.textContent = 'Breadcrumbs provide a navigation trail showing the current page location in the site hierarchy.';
  description.style.cssText = 'color: #6b7280; margin-bottom: 2rem;';
  
  const breadcrumbsContainer = document.createElement('div');
  breadcrumbsContainer.style.cssText = 'background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;';
  
  const breadcrumbTitle = document.createElement('h3');
  breadcrumbTitle.textContent = 'Current breadcrumbs:';
  breadcrumbTitle.style.cssText = 'margin: 0 0 12px 0; color: #374151; font-size: 14px;';
  
  const breadcrumbsList = document.createElement('div');
  breadcrumbsList.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';
  
  const updateBreadcrumbs = () => {
    breadcrumbsList.innerHTML = '';
    
    if (props.router?.breadcrumbs) {
      const crumbs = props.router.breadcrumbs();
      
      if (crumbs.length === 0) {
        const homeLink = document.createElement('a');
        homeLink.textContent = 'Home';
        homeLink.href = '/';
        homeLink.style.cssText = 'color: #3b82f6; text-decoration: none; font-weight: 500;';
        homeLink.onclick = (e) => {
          e.preventDefault();
          props.router?.push('/');
        };
        breadcrumbsList.appendChild(homeLink);
      } else {
        const homeLink = document.createElement('a');
        homeLink.textContent = 'Home';
        homeLink.href = '/';
        homeLink.style.cssText = 'color: #3b82f6; text-decoration: none;';
        homeLink.onclick = (e) => {
          e.preventDefault();
          props.router?.push('/');
        };
        breadcrumbsList.appendChild(homeLink);
        
        crumbs.forEach((crumb, index) => {
          const separator = document.createElement('span');
          separator.textContent = '›';
          separator.style.cssText = 'color: #9ca3af; user-select: none;';
          breadcrumbsList.appendChild(separator);
          
          if (index === crumbs.length - 1) {
            const current = document.createElement('span');
            current.textContent = crumb.label;
            current.style.cssText = 'color: #374151; font-weight: 600;';
            breadcrumbsList.appendChild(current);
          } else {
            const link = document.createElement('a');
            link.textContent = crumb.label;
            link.href = crumb.path;
            link.style.cssText = 'color: #3b82f6; text-decoration: none;';
            link.onclick = (e) => {
              e.preventDefault();
              props.router?.push(crumb.path);
            };
            breadcrumbsList.appendChild(link);
          }
        });
      }
    }
  };
  
  updateBreadcrumbs();
  
  setInterval(updateBreadcrumbs, 1000);
  
  breadcrumbsContainer.appendChild(breadcrumbTitle);
  breadcrumbsContainer.appendChild(breadcrumbsList);
  
  const infoBox = document.createElement('div');
  infoBox.style.cssText = 'background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px;';
  infoBox.innerHTML = `
    <h3 style="margin: 0 0 12px 0; color: #1e40af;">✨ Features:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
      <li>Automatic breadcrumb generation from URL path</li>
      <li>Custom labels via route metadata</li>
      <li>Dynamic breadcrumbs with route params</li>
      <li>Click to navigate</li>
    </ul>
  `;
  
  const code = document.createElement('pre');
  code.style.cssText = 'background: #1f2937; color: #f3f4f6; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 14px; margin-top: 2rem;';
  code.textContent = `// Usage:
const { router } = createRouter({
  routes: {
    '/breadcrumbs': {
      component: BreadcrumbsExample,
      meta: {
        breadcrumb: 'Breadcrumbs'
      }
    }
  }
});

// Access breadcrumbs:
const crumbs = router.breadcrumbs();
// Returns: [{ path: '/breadcrumbs', label: 'Breadcrumbs' }]`;
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(breadcrumbsContainer);
  container.appendChild(infoBox);
  container.appendChild(code);
  
  return container;
};

