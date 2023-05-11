import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Author } from '../../../../domain/entities/author/author';

export const findAuthorQueryHandlerResultSchema = Schema.object({
  author: Schema.instanceof(Author),
});

export type FindAuthorQueryHandlerResult = SchemaType<typeof findAuthorQueryHandlerResultSchema>;
