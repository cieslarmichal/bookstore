import { ApplicationError } from '../../../common/errors/applicationError';

interface Context {
  readonly userId: string;
}

export class UserIsNotCustomerError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('UserIsNotCustomerError', 'User is not a customer.', context);
  }
}
