import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createAuthorPayloadSchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  about: Schema.notEmptyString().optional(),
});

export type CreateAuthorPayload = SchemaType<typeof createAuthorPayloadSchema>;
