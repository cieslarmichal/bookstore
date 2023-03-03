import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
