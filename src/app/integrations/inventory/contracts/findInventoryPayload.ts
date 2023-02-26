import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
