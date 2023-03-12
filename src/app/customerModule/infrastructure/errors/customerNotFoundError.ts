import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly id?: string;
  readonly userId?: string;
}

export class CustomerNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CustomerNotFoundError', 'Customer not found.', context);
  }
}
