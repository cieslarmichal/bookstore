import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Author } from '../../../../domain/entities/author/author';

export const updateAuthorCommandHandlerResultSchema = Schema.object({
  author: Schema.instanceof(Author),
});

export type UpdateAuthorCommandHandlerResult = SchemaType<typeof updateAuthorCommandHandlerResultSchema>;
