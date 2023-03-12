import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly customerId: string;
  readonly targetCustomerId: string;
}

export class CustomerFromAccessTokenNotMatchingCustomerFromAddressError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'CustomerFromAccessTokenNotMatchingCustomerFromAddressError',
      `Customer id from access token's payload does not match customer id from address.`,
      context,
    );
  }
}
