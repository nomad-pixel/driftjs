import { state, setState, computed, type FC } from 'drift-spa';

export const Async: FC = () => {
  let userId = state(1);
  
  const userData = computed(async () => {
    const currentId = userId.value;
    console.log('Computed function executing, userId.value:', currentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    const finalId = userId.value;
    console.log('Computed function after await, userId.value:', finalId);
    return {
      id: finalId,
      name: `User ${finalId}`,
      email: `user${finalId}@example.com`
    };
  });
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Async Computed Example</h1>
      <p>User ID: {() => userId.value}</p>
      <div style={{ marginTop: '1rem' }}>
        {() => {
          const data = userData();
          if (!data) {
            return <p>Loading...</p>;
          }
          return [
            <p>Name: {data.name}</p>,
            <p>Email: {data.email}</p>
          ];
        }}
      </div>
      <button onClick={() => {
        setState(() => {
          userId.value = userId.value + 1;
        });
      }}>Next User</button>
    </div>
  );
};

