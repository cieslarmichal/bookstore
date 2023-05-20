import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteLineItemPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteLineItemPayload = SchemaType<typeof deleteLineItemPayloadSchema>;
