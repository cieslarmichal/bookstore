import { LogContext } from '../../logContext';

export interface DebugPayload {
  readonly message: string;
  readonly context?: LogContext;
}
