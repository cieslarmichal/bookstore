import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly lineItemQuantity: number;
  readonly inventoryQuantity: number;
}

export class LineItemOutOfInventoryError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('LineItemOutOfInventory', 'Line item out of inventory.', context);
  }
}
