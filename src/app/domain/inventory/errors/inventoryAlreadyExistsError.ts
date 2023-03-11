import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly bookId: string;
}

export class InventoryAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InventoryAlreadyExistsError', 'Inventory already exists.', context);
  }
}
