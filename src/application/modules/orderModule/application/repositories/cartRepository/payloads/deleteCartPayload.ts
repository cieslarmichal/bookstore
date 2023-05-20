import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCartPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCartPayload = SchemaType<typeof deleteCartPayloadSchema>;
