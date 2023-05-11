import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { AuthorBook } from '../../../../domain/entities/authorBook/authorBook';

export const createAuthorBookCommandHandlerResultSchema = Schema.object({
  authorBook: Schema.instanceof(AuthorBook),
});

export type CreateAuthorBookCommandHandlerResult = SchemaType<typeof createAuthorBookCommandHandlerResultSchema>;
