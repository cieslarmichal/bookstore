import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly cartId: string;
}

export class LineItemsNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('LineItemsNotProvidedError', 'Line items not provided.', context);
  }
}
