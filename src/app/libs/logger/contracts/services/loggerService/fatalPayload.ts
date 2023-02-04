import { LogContext } from '../../logContext';

export interface FatalPayload {
  readonly message: string;
  readonly context?: LogContext;
}
