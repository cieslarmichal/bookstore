import { LogContext } from '../../logContext';

export interface InfoPayload {
  readonly message: string;
  readonly context?: LogContext;
}
