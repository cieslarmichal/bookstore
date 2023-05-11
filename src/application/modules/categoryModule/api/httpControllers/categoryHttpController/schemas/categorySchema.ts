import { Schema } from '../../../../../../../libs/validator/schema';

export const categorySchema = Schema.object({
  id: Schema.string(),
  name: Schema.string(),
});
