import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly customerId: string;
  readonly whistlistEntryCustomerId: string;
}

export class CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'CustomerFromAccessTokenNotMatchingCustomerFromWhishlistEntryError',
      `Customer id from access token's payload does not match customer id from whishlist entry.`,
      context,
    );
  }
}
