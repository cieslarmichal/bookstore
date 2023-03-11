import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly cartId: string;
}

export class DeliveryMethodNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('DeliveryMethodNotProvidedError', 'Delivery method not provided.', context);
  }
}
