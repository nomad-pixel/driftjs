import { createSignal, render } from '@drift/runtime';

const [count, setCount] = createSignal(0);

const app = document.createElement('div');
app.innerHTML = `
  <h1>Debug Test</h1>
  <p>Count: <span id="count">0</span></p>
  <button id="increment">+</button>
  <button id="reset">Reset</button>
`;

document.getElementById('app')?.appendChild(app);

const updateCount = () => {
  const countElement = document.getElementById('count');
  if (countElement) {
    countElement.textContent = count().toString();
  }
};

document.getElementById('increment')?.addEventListener('click', () => {
  setCount(c => c + 1);
  updateCount();
});

document.getElementById('reset')?.addEventListener('click', () => {
  setCount(0);
  updateCount();
});

updateCount();

console.log('Debug test loaded');
