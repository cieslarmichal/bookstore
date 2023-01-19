import { ApplicationError } from '../../../common';

type UserIsNotACustomerContext = {
  readonly userId: string;
};

export class UserIsNotACustomer extends ApplicationError<UserIsNotACustomerContext> {
  public constructor(context: UserIsNotACustomerContext) {
    super(`User is not a customer.`, context);
  }
}
