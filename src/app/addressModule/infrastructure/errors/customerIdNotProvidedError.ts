import { ApplicationError } from '../../../../common/errors/applicationError';

export class CustomerIdNotProvidedError extends ApplicationError<void> {
  public constructor() {
    super('CustomerIdNotProvidedError', 'Customer id not provided.');
  }
}
