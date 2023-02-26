import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly inventoryId?: string;
  readonly bookId?: string;
}

export class InventoryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InventoryNotFoundError', 'Inventory not found.', context);
  }
}
