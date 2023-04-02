import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

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
    const { id, bookId, quantity } = Validator.validate(inventoryInputSchema, input);

    this.id = id;
    this.bookId = bookId;
    this.quantity = quantity;
  }
}
