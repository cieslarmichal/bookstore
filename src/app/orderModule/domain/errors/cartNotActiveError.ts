import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly cartId: string;
}

export class CartNotActiveError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CartNotActiveError', 'Cart not active.', context);
  }
}
