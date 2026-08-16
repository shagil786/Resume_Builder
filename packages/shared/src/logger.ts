export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private context?: string) {}

  info(msg: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify({ level: 'info', msg, context: this.context, ...meta, timestamp: new Date().toISOString() }));
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify({ level: 'warn', msg, context: this.context, ...meta, timestamp: new Date().toISOString() }));
  }

  error(msg: string, meta?: Record<string, unknown>) {
    console.error(JSON.stringify({ level: 'error', msg, context: this.context, ...meta, timestamp: new Date().toISOString() }));
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    console.debug(JSON.stringify({ level: 'debug', msg, context: this.context, ...meta, timestamp: new Date().toISOString() }));
  }
}
