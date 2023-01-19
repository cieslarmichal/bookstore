import { ApplicationError } from '../../errors';

interface Context {
  readonly validationErrors: any[];
}

export class ValidationError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ValidationError', context);
  }
}
