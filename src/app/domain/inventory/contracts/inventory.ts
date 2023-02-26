import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const inventoryInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type InventoryInput = SchemaType<typeof inventoryInputSchema>;

export class Inventory {
  public readonly id: string;
  public readonly bookId: string;
  public readonly quantity: number;

  public constructor(input: InventoryInput) {
    const { id, bookId, quantity } = PayloadFactory.create(inventoryInputSchema, input);

    this.id = id;
    this.bookId = bookId;
    this.quantity = quantity;
  }
}
