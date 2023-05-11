import { authorBookSchema } from './authorBookSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorBookPathParametersSchema = Schema.object({
  authorId: Schema.string(),
  bookId: Schema.string(),
});

export type CreateAuthorBookPathParameters = SchemaType<typeof createAuthorBookPathParametersSchema>;

export const createAuthorBookResponseCreatedBodySchema = Schema.object({
  authorBook: authorBookSchema,
});

export type CreateAuthorBookResponseCreatedBody = SchemaType<typeof createAuthorBookResponseCreatedBodySchema>;
