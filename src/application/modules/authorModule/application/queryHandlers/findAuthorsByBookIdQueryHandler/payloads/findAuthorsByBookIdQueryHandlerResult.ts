import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Author } from '../../../../domain/entities/author/author';

export const findAuthorsByBookIdQueryHandlerResultSchema = Schema.object({
  authors: Schema.array(Schema.instanceof(Author)),
});

export type FindAuthorsByBookIdQueryHandlerResult = SchemaType<typeof findAuthorsByBookIdQueryHandlerResultSchema>;
