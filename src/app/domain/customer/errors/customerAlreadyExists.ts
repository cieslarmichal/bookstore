import { ApplicationError } from '../../../common/errors/applicationError';

type CustomerAlreadyExistsContext = {
  readonly userId: string;
};

export class CustomerAlreadyExists extends ApplicationError<CustomerAlreadyExistsContext> {
  public constructor(context: CustomerAlreadyExistsContext) {
    super('Customer already exists.', context);
  }
}
