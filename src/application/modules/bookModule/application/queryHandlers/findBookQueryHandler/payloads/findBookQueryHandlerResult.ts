import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Book } from '../../../../domain/entities/book/book';

export const findBookQueryHandlerResultSchema = Schema.object({
  book: Schema.instanceof(Book),
});

export type FindBookQueryHandlerResult = SchemaType<typeof findBookQueryHandlerResultSchema>;
