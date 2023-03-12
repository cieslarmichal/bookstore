import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly id: string;
}

export class LineItemNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('LineItemNotFoundError', 'Line item not found.', context);
  }
}
