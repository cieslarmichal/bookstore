import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly cartId: string;
}

export class ShippingAddressNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ShippingAddressNotProvidedError', 'Shipping address not provided.', context);
  }
}
