import { LogContext } from '../../logContext';

export interface ErrorPayload {
  readonly message: string;
  readonly context?: LogContext;
}
