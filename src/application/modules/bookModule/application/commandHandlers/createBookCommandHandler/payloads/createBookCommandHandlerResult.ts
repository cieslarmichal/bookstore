import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Book } from '../../../../domain/entities/book/book';

export const createBookCommandHandlerResultSchema = Schema.object({
  book: Schema.instanceof(Book),
});

export type CreateBookCommandHandlerResult = SchemaType<typeof createBookCommandHandlerResultSchema>;
