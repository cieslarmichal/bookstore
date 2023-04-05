import { Schema } from '../../../../../../../libs/validator/schema';

export const customerSchema = Schema.object({
  id: Schema.string(),
  userId: Schema.string(),
});
