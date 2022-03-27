import { DomainError } from '../../../shared';

type UserIsNotACustomerContext = {
  readonly userId: string;
};

export class UserIsNotACustomer extends DomainError<UserIsNotACustomerContext> {
  public constructor(context: UserIsNotACustomerContext) {
    super(`User is not a customer.`, context);
  }
}
