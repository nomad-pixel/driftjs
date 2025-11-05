import { Suspense, createResource, type FC } from 'drift-spa';

// Simulated API calls
const fetchProfile = async (): Promise<{ name: string; avatar: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    name: 'John Doe',
    avatar: '👤'
  };
};

const fetchPosts = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return [
    'My first post about Drift!',
    'Loving the Suspense API',
    'Building something cool...'
  ];
};

const fetchComments = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return 42;
};

const Profile: FC = () => {
  const profileResource = createResource(fetchProfile);
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem; background: #dbeafe; border-radius: 8px; margin-bottom: 1rem;';
  
  const profile = profileResource();
  
  if (profile) {
    const header = document.createElement('h3');
    header.textContent = `${profile.avatar} ${profile.name}`;
    header.style.cssText = 'margin: 0; color: #1e40af;';
    
    container.appendChild(header);
  }
  
  return container;
};

const Posts: FC = () => {
  const postsResource = createResource(fetchPosts);
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem; background: #fef3c7; border-radius: 8px; margin-bottom: 1rem;';
  
  const title = document.createElement('h4');
  title.textContent = '📝 Recent Posts';
  title.style.cssText = 'margin: 0 0 12px 0; color: #92400e;';
  
  const posts = postsResource();
  
  container.appendChild(title);
  
  if (posts) {
    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.textContent = `• ${post}`;
      postEl.style.cssText = 'padding: 6px 0; color: #78350f;';
      container.appendChild(postEl);
    });
  }
  
  return container;
};

const Comments: FC = () => {
  const commentsResource = createResource(fetchComments);
  
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem; background: #dcfce7; border-radius: 8px;';
  
  const count = commentsResource();
  
  if (count !== undefined) {
    const text = document.createElement('p');
    text.textContent = `💬 ${count} Comments`;
    text.style.cssText = 'margin: 0; color: #166534; font-weight: 600;';
    
    container.appendChild(text);
  }
  
  return container;
};

export const SuspenseNestedPage: FC = () => {
  const container = document.createElement('div');
  container.style.cssText = 'padding: 1rem; max-width: 700px;';
  
  const title = document.createElement('h1');
  title.textContent = 'Nested Suspense Example';
  
  const description = document.createElement('p');
  description.textContent = 'Each section loads independently with its own loading state. Watch how they resolve at different times!';
  description.style.color = '#666';
  
  // Profile suspense (fastest - 1s)
  const profileSuspense = Suspense({
    fallback: (() => {
      const loader = document.createElement('div');
      loader.style.cssText = 'padding: 1rem; background: #eff6ff; border-radius: 8px; margin-bottom: 1rem;';
      loader.textContent = '⏳ Loading profile...';
      loader.style.color = '#1e40af';
      return loader;
    })(),
    children: Profile({})
  });
  
  // Posts suspense (slowest - 2s)
  const postsSuspense = Suspense({
    fallback: (() => {
      const loader = document.createElement('div');
      loader.style.cssText = 'padding: 1rem; background: #fef9c3; border-radius: 8px; margin-bottom: 1rem;';
      loader.textContent = '⏳ Loading posts...';
      loader.style.color = '#92400e';
      return loader;
    })(),
    children: Posts({})
  });
  
  // Comments suspense (medium - 1.5s)
  const commentsSuspense = Suspense({
    fallback: (() => {
      const loader = document.createElement('div');
      loader.style.cssText = 'padding: 1rem; background: #f0fdf4; border-radius: 8px;';
      loader.textContent = '⏳ Loading comments...';
      loader.style.color = '#166534';
      return loader;
    })(),
    children: Comments({})
  });
  
  const info = document.createElement('div');
  info.style.cssText = 'margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; color: #4b5563; font-size: 14px;';
  info.innerHTML = `
    <strong>Loading times:</strong><br/>
    • Profile: 1 second<br/>
    • Comments: 1.5 seconds<br/>
    • Posts: 2 seconds
  `;
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(profileSuspense);
  container.appendChild(postsSuspense);
  container.appendChild(commentsSuspense);
  container.appendChild(info);
  
  return container;
};

