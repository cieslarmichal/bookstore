import { Schema } from '../../../../../../../libs/validator/schema';

export const authorSchema = Schema.object({
  id: Schema.string(),
  firstName: Schema.string(),
  lastName: Schema.string(),
  about: Schema.string().optional(),
});
