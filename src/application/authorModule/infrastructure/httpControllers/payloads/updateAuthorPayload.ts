import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const updateAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  about: Schema.notEmptyString(),
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
