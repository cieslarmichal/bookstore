import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly id?: string;
}

export class InventoryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InventoryNotFoundError', 'Inventory not found.', context);
  }
}
