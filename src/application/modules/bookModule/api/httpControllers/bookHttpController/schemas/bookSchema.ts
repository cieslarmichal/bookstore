import { Schema } from '../../../../../../../libs/validator/schema';
import { BookFormat } from '../../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../../domain/entities/book/bookLanguage';

export const bookSchema = Schema.object({
  id: Schema.string(),
  title: Schema.string(),
  isbn: Schema.string(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.string().optional(),
});
