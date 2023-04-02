import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteAuthorPayload = SchemaType<typeof deleteAuthorPayloadSchema>;
