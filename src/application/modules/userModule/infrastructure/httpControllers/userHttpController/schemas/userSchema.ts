import { Schema } from '../../../../../../../libs/validator/schema';

export const userSchema = Schema.object({
  id: Schema.string(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
});
