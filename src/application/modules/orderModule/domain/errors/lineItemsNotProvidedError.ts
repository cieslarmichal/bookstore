import { ApplicationError } from '../../../../../common/errors/applicationError';

interface Context {
  readonly cartId: string;
}

export class LineItemsNotProvidedError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('LineItemsNotProvidedError', 'Line items not provided.', context);
  }
}
