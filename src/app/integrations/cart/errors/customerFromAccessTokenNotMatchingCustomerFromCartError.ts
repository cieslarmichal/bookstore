import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly customerId: string;
  readonly targetCustomerId: string;
}

export class CustomerFromAccessTokenNotMatchingCustomerFromCartError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'CustomerFromAccessTokenNotMatchingCustomerFromCartError',
      `Customer id from access token's payload does not match customer id from cart.`,
      context,
    );
  }
}
