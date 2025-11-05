import { state, setState } from 'drift-spa';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
}

export class LoggerService {
  logs = state<LogEntry[]>([]);
  maxLogs = 100;
  
  private addLog(level: LogLevel, message: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date()
    };
    
    setState(() => {
      this.logs.value = [...this.logs.value, entry].slice(-this.maxLogs);
    });
    
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](`[${level.toUpperCase()}]`, message);
  }
  
  info(message: string) {
    this.addLog('info', message);
  }
  
  warn(message: string) {
    this.addLog('warn', message);
  }
  
  error(message: string) {
    this.addLog('error', message);
  }
  
  debug(message: string) {
    this.addLog('debug', message);
  }
  
  clear() {
    setState(() => {
      this.logs.value = [];
    });
  }
  
  onInit() {
    this.info('LoggerService initialized');
  }
  
  onDestroy() {
    this.info('LoggerService destroyed');
  }
}

