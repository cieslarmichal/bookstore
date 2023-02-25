import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly cartId: string;
}

export class BillingAddressNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('BillingAddressNotProvidedError', 'Billing address not provided.', context);
  }
}
