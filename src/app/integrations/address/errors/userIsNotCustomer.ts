import { ApplicationError } from '../../../common/errors/applicationError';

type UserIsNotCustomerContext = {
  readonly userId: string;
};

export class UserIsNotCustomer extends ApplicationError<UserIsNotCustomerContext> {
  public constructor(context: UserIsNotCustomerContext) {
    super(`User is not a customer.`, context);
  }
}
