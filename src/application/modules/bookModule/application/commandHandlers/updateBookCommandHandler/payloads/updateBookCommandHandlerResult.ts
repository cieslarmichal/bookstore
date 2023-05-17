import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Book } from '../../../../domain/entities/book/book';

export const updateBookCommandHandlerResultSchema = Schema.object({
  book: Schema.instanceof(Book),
});

export type UpdateBookCommandHandlerResult = SchemaType<typeof updateBookCommandHandlerResultSchema>;
