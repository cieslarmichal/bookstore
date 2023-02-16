import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly id: string;
}

export class LineItemNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('LineItemNotFoundError', 'Line item not found.', context);
  }
}
