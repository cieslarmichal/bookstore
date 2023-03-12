import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindAuthorPayload = SchemaType<typeof findAuthorPayloadSchema>;
