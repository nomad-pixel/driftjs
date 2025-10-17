
interface SignalInfo {
  name: string;
  value: any;
  subscribers: number;
  lastUpdated: number;
}

interface EffectInfo {
  name: string;
  dependencies: string[];
  lastRun: number;
  isDisposed: boolean;
}

class DriftDevTools {
  private signals = new Map<any, SignalInfo>();
  private effects = new Map<any, EffectInfo>();
  public isEnabled = false;
  private updateInterval: number | null = null;

  enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    
    
    this.createDevToolsPanel();
    
    
    this.startMonitoring();
    
    console.log('🔧 Drift DevTools включены');
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.removeDevToolsPanel();
    console.log('🔧 Drift DevTools отключены');
  }

  private createDevToolsPanel() {
    const panel = document.createElement('div');
    panel.id = 'drift-devtools';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 500px;
      background: #1e1e1e;
      color: #fff;
      border: 1px solid #333;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #2d2d2d;
      padding: 8px 12px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span style="font-weight: bold; color: #4fc3f7;">Drift DevTools</span>
      <button id="drift-devtools-close" style="
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 20px;
        height: 20px;
      ">×</button>
    `;

    const content = document.createElement('div');
    content.id = 'drift-devtools-content';
    content.style.cssText = `
      padding: 8px;
      max-height: 400px;
      overflow-y: auto;
    `;

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);

    
    document.getElementById('drift-devtools-close')?.addEventListener('click', () => {
      this.disable();
    });
  }

  private removeDevToolsPanel() {
    const panel = document.getElementById('drift-devtools');
    if (panel) {
      panel.remove();
    }
  }

  private startMonitoring() {
    this.updateInterval = window.setInterval(() => {
      this.updatePanel();
    }, 1000);
  }

  private updatePanel() {
    const content = document.getElementById('drift-devtools-content');
    if (!content) return;

    const signalsHtml = Array.from(this.signals.values())
      .map(signal => `
        <div style="margin-bottom: 8px; padding: 6px; background: #2a2a2a; border-radius: 4px;">
          <div style="color: #4fc3f7; font-weight: bold;">${signal.name}</div>
          <div style="color: #a0a0a0; font-size: 11px;">
            Value: <span style="color: #fff;">${JSON.stringify(signal.value)}</span>
          </div>
          <div style="color: #a0a0a0; font-size: 11px;">
            Subscribers: ${signal.subscribers} | Updated: ${new Date(signal.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      `).join('');

    const effectsHtml = Array.from(this.effects.values())
      .map(effect => `
        <div style="margin-bottom: 8px; padding: 6px; background: #2a2a2a; border-radius: 4px;">
          <div style="color: #81c784; font-weight: bold;">${effect.name}</div>
          <div style="color: #a0a0a0; font-size: 11px;">
            Dependencies: ${effect.dependencies.join(', ') || 'none'}
          </div>
          <div style="color: #a0a0a0; font-size: 11px;">
            Last run: ${new Date(effect.lastRun).toLocaleTimeString()} | 
            Status: <span style="color: ${effect.isDisposed ? '#f44336' : '#4caf50'}">${effect.isDisposed ? 'disposed' : 'active'}</span>
          </div>
        </div>
      `).join('');

    content.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="color: #4fc3f7; font-weight: bold; margin-bottom: 8px;">Signals (${this.signals.size})</div>
        ${signalsHtml || '<div style="color: #666;">No signals</div>'}
      </div>
      <div>
        <div style="color: #81c784; font-weight: bold; margin-bottom: 8px;">Effects (${this.effects.size})</div>
        ${effectsHtml || '<div style="color: #666;">No effects</div>'}
      </div>
    `;
  }

  trackSignal(signal: any, name: string, value: any, subscribers: number) {
    if (!this.isEnabled) return;
    
    this.signals.set(signal, {
      name,
      value,
      subscribers,
      lastUpdated: Date.now()
    });
  }

  trackEffect(effect: any, name: string, dependencies: string[]) {
    if (!this.isEnabled) return;
    
    this.effects.set(effect, {
      name,
      dependencies,
      lastRun: Date.now(),
      isDisposed: false
    });
  }

  updateEffect(effect: any, isDisposed = false) {
    if (!this.isEnabled) return;
    
    const info = this.effects.get(effect);
    if (info) {
      info.lastRun = Date.now();
      info.isDisposed = isDisposed;
    }
  }

  
  getStats() {
    return {
      signals: Array.from(this.signals.values()),
      effects: Array.from(this.effects.values())
    };
  }
}

export const devtools = new DriftDevTools();

if (typeof window !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (devtools.isEnabled) {
        devtools.disable();
      } else {
        devtools.enable();
      }
    }
  });
  
  (window as any).driftDevTools = devtools;
}
