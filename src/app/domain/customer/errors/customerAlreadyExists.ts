import { DomainError } from '../../../shared/errors/domainError';

type CustomerAlreadyExistsContext = {
  readonly userId: string;
};

export class CustomerAlreadyExists extends DomainError<CustomerAlreadyExistsContext> {
  public constructor(context: CustomerAlreadyExistsContext) {
    super('Customer already exists.', context);
  }
}
