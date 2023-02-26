import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const deleteInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteInventoryPayload = SchemaType<typeof deleteInventoryPayloadSchema>;
