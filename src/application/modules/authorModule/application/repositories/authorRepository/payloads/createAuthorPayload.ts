import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorPayloadSchema = Schema.object({
  id: Schema.string(),
  firstName: Schema.string(),
  lastName: Schema.string(),
  about: Schema.string().optional(),
});

export type CreateAuthorPayload = SchemaType<typeof createAuthorPayloadSchema>;
