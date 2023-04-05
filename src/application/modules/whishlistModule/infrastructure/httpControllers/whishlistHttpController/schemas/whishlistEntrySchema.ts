import { Schema } from '../../../../../../../libs/validator/schema';

export const whishlistEntrySchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
});
