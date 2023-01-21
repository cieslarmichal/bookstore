import { ApplicationError } from '../../errors/applicationError.js';

interface Context {
  readonly target: unknown;
  readonly property: string;
  readonly value: unknown;
  readonly constraints: Record<string, string>;
}

export class ValidationError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ValidationError', 'Validation error.', context);
  }
}
