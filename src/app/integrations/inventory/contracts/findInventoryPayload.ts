import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const findInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
