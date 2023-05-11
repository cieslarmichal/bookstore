import { Schema } from '../../../../../../../libs/validator/schema';

export const reviewSchema = Schema.object({
  id: Schema.string(),
  isbn: Schema.string(),
  rate: Schema.positiveInteger(),
  comment: Schema.string().optional(),
  customerId: Schema.string(),
});
