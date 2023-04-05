import { Schema } from '../../../../../../../libs/validator/schema';

export const userSchema = Schema.object({
  id: Schema.notEmptyString(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
});
