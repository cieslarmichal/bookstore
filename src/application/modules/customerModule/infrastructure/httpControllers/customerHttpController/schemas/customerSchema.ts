import { Schema } from '../../../../../../../libs/validator/schema';

export const customerSchema = Schema.object({
  id: Schema.notEmptyString(),
  userId: Schema.notEmptyString(),
});
