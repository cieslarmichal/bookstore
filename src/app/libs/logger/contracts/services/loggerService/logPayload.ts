import { LogContext } from '../../logContext';

export interface LogPayload {
  readonly message: string;
  readonly context?: LogContext;
}
