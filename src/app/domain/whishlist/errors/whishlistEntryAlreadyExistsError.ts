import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly bookId: string;
  readonly customerId: string;
}

export class WhishlistEntryAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('WhishlistEntryAlreadyExistsError', 'Whishlist entry already exists.', context);
  }
}
