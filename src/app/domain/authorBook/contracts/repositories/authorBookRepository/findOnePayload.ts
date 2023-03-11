import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const findOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString().optional(),
  authorId: Schema.notEmptyString().optional(),
  bookId: Schema.notEmptyString().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
