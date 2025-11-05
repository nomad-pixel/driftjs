import { state, computed, setState } from 'drift-spa';

export class ThemeService {
  isDark = state(false);
  
  theme = computed(() => ({
    primaryColor: this.isDark.value ? '#e74c3c' : '#3498db',
    backgroundColor: this.isDark.value ? '#2c3e50' : '#ffffff',
    textColor: this.isDark.value ? '#ecf0f1' : '#333333',
    buttonColor: this.isDark.value ? '#c0392b' : '#2980b9'
  }));
  
  toggle() {
    setState(() => {
      this.isDark.value = !this.isDark.value;
    });
  }
  
  setTheme(theme: 'light' | 'dark') {
    setState(() => {
      this.isDark.value = theme === 'dark';
    });
  }
}

