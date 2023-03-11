import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const createAuthorBookPayloadSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
