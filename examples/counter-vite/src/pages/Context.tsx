import { state, setState, computed, effect, createContext, provideContext, injectContext, type FC } from 'drift-spa';

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

const ThemeContext = createContext<Theme>({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff',
  textColor: '#333333'
}, 'ThemeContext');

const ThemeButton: FC = () => {
  const theme = injectContext(ThemeContext);
  
  return (
    <button style={{ 
      background: theme.primaryColor, 
      color: '#fff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}>
      Action Button
    </button>
  );
};

const ThemedCard: FC<{ title: string }> = (props) => {
  const theme = injectContext(ThemeContext);
  
  return (
    <div style={{ 
      background: theme.backgroundColor,
      color: theme.textColor,
      padding: '1rem',
      border: `2px solid ${theme.primaryColor}`,
      borderRadius: '8px',
      marginTop: '1rem'
    }}>
      <h3 style={{ color: theme.primaryColor }}>{props.title}</h3>
      <p>This card uses the theme from context</p>
      <ThemeButton />
    </div>
  );
};

export const Context: FC = () => {
  let currentTheme = state<'light' | 'dark'>('light');
  
  const theme = computed(() => {
    if (currentTheme.value === 'light') {
      return {
        primaryColor: '#3498db',
        backgroundColor: '#ffffff',
        textColor: '#333333'
      };
    } else {
      return {
        primaryColor: '#e74c3c',
        backgroundColor: '#2c3e50',
        textColor: '#ecf0f1'
      };
    }
  });
  
  effect(() => {
    const themeValue = theme();
    provideContext(ThemeContext, themeValue);
  }, [theme]);
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Context API Example</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => {
          setState(() => {
            currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
          });
        }}>
          Toggle Theme (Current: {() => currentTheme.value})
        </button>
      </div>
      
      {() => {
        provideContext(ThemeContext, theme());
        return [
          <ThemedCard title="Card 1" />,
          <ThemedCard title="Card 2" />
        ];
      }}
    </div>
  );
};

