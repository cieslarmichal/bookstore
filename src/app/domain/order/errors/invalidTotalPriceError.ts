import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly cartId: string;
  readonly totalPrice: number;
  readonly sumOfLineItemsPrices: number;
}

export class InvalidTotalPriceError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InvalidTotalPriceError', 'Invalid total price.', context);
  }
}
