import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
