import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly userId: string;
}

export class CustomerAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CustomerAlreadyExistsError', 'Customer already exists.', context);
  }
}
