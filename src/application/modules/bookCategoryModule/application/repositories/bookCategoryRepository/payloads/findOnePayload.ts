import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.string().optional(),
  bookId: Schema.string().optional(),
  categoryId: Schema.string().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
