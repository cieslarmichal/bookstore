import { ApplicationError } from '../../../../../common/errors/applicationError';

interface Context {
  readonly id: string;
}

export class CartNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CartNotFoundError', 'Cart not found.', context);
  }
}
