import { DomainError } from '../../../shared/errors/domainError';

type CustomerNotFoundContext = {
  readonly id?: string;
  readonly userId?: string;
};

export class CustomerNotFound extends DomainError<CustomerNotFoundContext> {
  public constructor(context: CustomerNotFoundContext) {
    super('Customer not found.', context);
  }
}
