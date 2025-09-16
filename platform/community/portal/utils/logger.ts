// Houston EJ-AI Platform - Production Logging System
// Structured logging with different levels and contexts

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? `\n  Error: ${entry.error.message}\n  Stack: ${entry.error.stack}` : '';
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`;
    } else {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(entry);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    const formattedLog = this.formatLogEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Specialized logging methods
  apiRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration,
      type: 'api_request',
    });
  }

  databaseQuery(query: string, duration: number, rowCount?: number): void {
    this.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration,
      rowCount,
      type: 'database_query',
    });
  }

  blockchainTransaction(hash: string, status: string, gasUsed?: number): void {
    this.info('Blockchain Transaction', {
      hash,
      status,
      gasUsed,
      type: 'blockchain_transaction',
    });
  }
}

// Export singleton instance
export const logger = new Logger();