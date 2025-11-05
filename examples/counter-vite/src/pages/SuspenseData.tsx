import { Suspense, createResource, state, setState, type FC } from 'drift-spa';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

const fetchUser = async (id: number): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

const UserCard: FC<{ userId: number }> = (props) => {
  const userResource = createResource(() => fetchUser(props.userId));
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1.5rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 1rem;';
  
  const user = userResource();
  
  if (user) {
    const name = document.createElement('h3');
    name.textContent = user.name;
    name.style.cssText = 'margin: 0 0 8px 0; color: #1f2937;';
    
    const username = document.createElement('p');
    username.textContent = `@${user.username}`;
    username.style.cssText = 'margin: 0 0 8px 0; color: #6b7280; font-style: italic;';
    
    const email = document.createElement('p');
    email.textContent = `📧 ${user.email}`;
    email.style.cssText = 'margin: 0; color: #4b5563;';
    
    container.appendChild(name);
    container.appendChild(username);
    container.appendChild(email);
  }
  
  return container;
};

export const SuspenseDataPage: FC = () => {
  let userId = state(1);
  let key = state(0);
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem; max-width: 600px;';
  
  const title = document.createElement('h1');
  title.textContent = 'Suspense + Data Fetching Example';
  
  const description = document.createElement('p');
  description.textContent = 'Fetches user data from JSONPlaceholder API with automatic loading states.';
  description.style.color = '#666';
  
  const controls = document.createElement('div');
  controls.style.cssText = 'display: flex; gap: 10px; margin: 1rem 0;';
  
  const prevButton = document.createElement('button');
  prevButton.textContent = '← Previous User';
  prevButton.style.cssText = 'padding: 10px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;';
  prevButton.onclick = () => {
    setState(() => {
      if (userId.value > 1) {
        userId.value--;
        key.value++;
      }
    });
  };
  
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next User →';
  nextButton.style.cssText = 'padding: 10px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;';
  nextButton.onclick = () => {
    setState(() => {
      if (userId.value < 10) {
        userId.value++;
        key.value++;
      }
    });
  };
  
  const currentUserId = document.createElement('span');
  currentUserId.textContent = () => `User ID: ${userId.value}`;
  currentUserId.style.cssText = 'padding: 10px 16px; background: #f3f4f6; border-radius: 6px; font-weight: 600;';
  
  controls.appendChild(prevButton);
  controls.appendChild(currentUserId);
  controls.appendChild(nextButton);
  
  const suspenseContainer = document.createElement('div');
  
  const renderContent = () => {
    while (suspenseContainer.firstChild) {
      suspenseContainer.removeChild(suspenseContainer.firstChild);
    }
    
    const suspenseNode = Suspense({
      fallback: (() => {
        const loader = document.createElement('div');
        loader.style.cssText = 'padding: 2rem; text-align: center; background: #f9fafb; border-radius: 8px; margin-top: 1rem;';
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        `;
        
        const text = document.createElement('p');
        text.textContent = 'Loading user data...';
        text.style.cssText = 'color: #6b7280; margin: 0;';
        
        loader.appendChild(spinner);
        loader.appendChild(text);
        return loader;
      })(),
      children: UserCard({ userId: userId.value }),
      onResolve: () => {
        console.log(`User ${userId.value} loaded successfully`);
      },
      onError: (error) => {
        console.error('Failed to load user:', error);
      }
    });
    
    suspenseContainer.appendChild(suspenseNode);
  };
  
  renderContent();
  
  // Watch for changes
  let prevKey = key.value;
  setInterval(() => {
    if (prevKey !== key.value) {
      prevKey = key.value;
      renderContent();
    }
  }, 100);
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(controls);
  container.appendChild(suspenseContainer);
  
  return container;
};

