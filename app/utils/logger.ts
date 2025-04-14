type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  userId?: string;
  details?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, action: string, userId?: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      action,
      userId,
      details,
    };
  }

  private log(entry: LogEntry) {
    this.logs.push(entry);
    // 在开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      const { timestamp, level, action, userId, details } = entry;
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${action}${userId ? ` (用户ID: ${userId})` : ''}`);
      if (details) {
        console.log('详情:', details);
      }
    }
  }

  info(action: string, userId?: string, details?: any) {
    this.log(this.formatLog('info', action, userId, details));
  }

  warn(action: string, userId?: string, details?: any) {
    this.log(this.formatLog('warn', action, userId, details));
  }

  error(action: string, userId?: string, details?: any) {
    this.log(this.formatLog('error', action, userId, details));
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 