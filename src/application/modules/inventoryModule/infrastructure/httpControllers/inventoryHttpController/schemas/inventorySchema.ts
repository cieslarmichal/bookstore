import { Schema } from '../../../../../../../libs/validator/schema';

export const inventorySchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});
