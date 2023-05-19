import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoryPayloadSchema = Schema.object({
  id: Schema.string().optional(),
  bookId: Schema.string().optional(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
