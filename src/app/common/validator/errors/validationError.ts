import { ZodIssue } from 'zod';

import { ApplicationError } from '../../errors/contracts/applicationError';

interface Context {
  readonly target: unknown;
  readonly issues: ZodIssue[];
  readonly message: string;
}

export class ValidationError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ValidationError', 'Validation error.', context);
  }
}
