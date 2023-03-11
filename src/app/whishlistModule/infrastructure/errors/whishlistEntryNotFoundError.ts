import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly id: string;
}

export class WhishlistEntryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('WhishlistEntryNotFoundError', 'Whishlist entry not found.', context);
  }
}
