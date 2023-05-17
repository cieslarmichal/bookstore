import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Book } from '../../../../domain/entities/book/book';

export const findBooksQueryHandlerResultSchema = Schema.object({
  books: Schema.array(Schema.instanceof(Book)),
});

export type FindBooksQueryHandlerResult = SchemaType<typeof findBooksQueryHandlerResultSchema>;
