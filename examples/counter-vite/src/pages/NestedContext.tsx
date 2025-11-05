import { state, setState, createContext, provideContext, injectContext, type FC } from 'drift-spa';

type User = {
  id: number;
  name: string;
  email: string;
};

const UserContext = createContext<User | null>(null, 'UserContext');

const UserProfile: FC = () => {
  const user = injectContext(UserContext);
  
  if (!user) {
    return <p>No user logged in</p>;
  }
  
  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
      <h3>User Profile</h3>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

const UserGreeting: FC = () => {
  const user = injectContext(UserContext);
  
  if (!user) {
    return <p>Welcome, Guest!</p>;
  }
  
  return <p>Welcome, {user.name}!</p>;
};

export const NestedContext: FC = () => {
  let user = state<User | null>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Nested Context Example</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => {
          setState(() => {
            if (user.value) {
              user.value = null;
            } else {
              user.value = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com'
              };
            }
          });
        }}>
          {() => user.value ? 'Logout' : 'Login'}
        </button>
      </div>
      
      {() => {
        provideContext(UserContext, user.value);
        return [
          <UserGreeting />,
          <div style={{ marginTop: '1rem' }}>
            <UserProfile />
          </div>
        ];
      }}
    </div>
  );
};

