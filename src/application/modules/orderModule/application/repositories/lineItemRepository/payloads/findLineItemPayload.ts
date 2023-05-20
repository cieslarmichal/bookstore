import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findLineItemPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindLineItemPayload = SchemaType<typeof findLineItemPayloadSchema>;
