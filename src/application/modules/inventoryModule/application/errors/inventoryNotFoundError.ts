import { ApplicationError } from '../../../../../common/errors/applicationError';

interface Context {
  readonly inventoryId?: string | undefined;
  readonly bookId?: string | undefined;
}

export class InventoryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InventoryNotFoundError', 'Inventory not found.', context);
  }
}
