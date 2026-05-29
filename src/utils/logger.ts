/**
 * Structured JSON Logger — NIST SP 800-92 / DE.CM compliant
 * Uses console methods for Edge Runtime + Node.js compatibility.
 * Cloud Run captures console output as structured logs automatically.
 * Never logs PII, secrets, or API keys.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
}

function emit(level: LogLevel, service: string, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...(context && { context }),
  };
  const line = JSON.stringify(entry);
  // console.error → stderr for WARN/ERROR, console.log → stdout for INFO
  // Both work in Edge Runtime AND Node.js runtime
  if (level === 'ERROR' || level === 'WARN') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (service: string, message: string, context?: Record<string, unknown>) =>
    emit('INFO', service, message, context),
  warn: (service: string, message: string, context?: Record<string, unknown>) =>
    emit('WARN', service, message, context),
  error: (service: string, message: string, context?: Record<string, unknown>) =>
    emit('ERROR', service, message, context),
};
