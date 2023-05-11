import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAuthorBookPayloadSchema = Schema.object({
  id: Schema.string().optional(),
  authorId: Schema.string().optional(),
  bookId: Schema.string().optional(),
});

export type FindAuthorBookPayload = SchemaType<typeof findAuthorBookPayloadSchema>;
