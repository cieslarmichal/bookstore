import { ApplicationError } from '../../../../../common/errors/applicationError';

interface Context {
  readonly customerId: string;
  readonly reviewCustomerId: string;
}

export class CustomerFromAccessTokenNotMatchingCustomerFromReviewError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'CustomerFromAccessTokenNotMatchingCustomerFromReviewError',
      `Customer id from access token's payload does not match customer id from review.`,
      context,
    );
  }
}
