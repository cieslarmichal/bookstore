import { Schema } from '../../../../../../../libs/validator/schema';

export const inventorySchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  quantity: Schema.integer(),
});
