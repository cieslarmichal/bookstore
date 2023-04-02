import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteInventoryPayload = SchemaType<typeof deleteInventoryPayloadSchema>;
