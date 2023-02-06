import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const createAuthorBookPayloadSchema = Schema.object({
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
