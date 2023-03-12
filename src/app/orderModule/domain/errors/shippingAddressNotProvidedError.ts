import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly cartId: string;
}

export class ShippingAddressNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ShippingAddressNotProvidedError', 'Shipping address not provided.', context);
  }
}
