import { state, setState, computed, type FC } from 'drift-spa';

export const Home: FC = () => {
  let count = state(0);
  const doubleCount = computed(() => count.value * 2);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Drift Simple Test</h1>
      <p>Count: {() => count.value}</p>
      <p>Double: {() => doubleCount()}</p>
      <button onClick={() => {
        setState(() => {
          count.value = count.value + 1;
        });
      }}>+</button>
      <button onClick={() => {
        setState(() => {
          count.value = 0;
        });
      }}>Reset</button>
    </div>
  );
};

