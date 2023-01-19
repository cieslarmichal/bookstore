import { ApplicationError } from '../../../common/errors/applicationError';

type CustomerNotFoundContext = {
  readonly id?: string;
  readonly userId?: string;
};

export class CustomerNotFound extends ApplicationError<CustomerNotFoundContext> {
  public constructor(context: CustomerNotFoundContext) {
    super('Customer not found.', context);
  }
}
