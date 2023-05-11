import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAuthorPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindAuthorPayload = SchemaType<typeof findAuthorPayloadSchema>;
