import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly id: string;
}

export class AddressNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('AddressNotFoundError', 'Address not found.', context);
  }
}
