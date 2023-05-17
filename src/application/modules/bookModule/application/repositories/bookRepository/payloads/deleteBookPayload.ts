import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteBookPayload = SchemaType<typeof deleteBookPayloadSchema>;
