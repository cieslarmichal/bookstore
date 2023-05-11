import { Schema } from '../../../../../../../libs/validator/schema';

export const whishlistEntrySchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  customerId: Schema.string(),
});
