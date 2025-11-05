import { state, setState, inject, type FC } from 'drift-spa';
import { ApiService } from '../services/api.service';
import { LoggerService } from '../services/logger.service';

export const ApiServicePage: FC = () => {
  const api = inject(ApiService);
  const logger = inject(LoggerService);
  
  let userId = state(1);
  let loading = state(false);
  let user = state<any>(null);
  
  const fetchUser = async () => {
    setState(() => { loading.value = true; });
    try {
      const data = await api.fetchUser(userId.value);
      setState(() => { user.value = data; });
      logger.info(`Loaded user: ${data.name}`);
    } catch (err) {
      logger.error('Failed to load user');
    } finally {
      setState(() => { loading.value = false; });
    }
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>API Service Example</h1>
      <p>ApiService инжектится автоматически</p>
      
      <div style={{ marginTop: '1rem' }}>
        <label>User ID: </label>
        <input 
          type="number" 
          value={userId.value}
          onInput={(e) => setState(() => { userId.value = Number((e.target as HTMLInputElement).value); })}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={fetchUser}>Fetch User</button>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        {() => loading.value ? (
          <p>Loading...</p>
        ) : user.value ? (
          <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
            <h3>{user.value.name}</h3>
            <p>Email: {user.value.email}</p>
            <p>ID: {user.value.id}</p>
          </div>
        ) : (
          <p>Click "Fetch User" to load data</p>
        )}
      </div>
    </div>
  );
};

