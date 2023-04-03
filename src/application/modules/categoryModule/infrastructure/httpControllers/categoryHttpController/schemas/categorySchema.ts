import { Schema } from '../../../../../../../libs/validator/schema';

export const categorySchema = Schema.object({
  id: Schema.notEmptyString(),
  name: Schema.notEmptyString(),
});
