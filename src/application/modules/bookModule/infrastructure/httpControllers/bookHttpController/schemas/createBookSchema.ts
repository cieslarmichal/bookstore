import { bookSchema } from './bookSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { BookFormat } from '../../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../../domain/entities/book/bookLanguage';

export const createBookBodySchema = Schema.object({
  title: Schema.string(),
  isbn: Schema.string(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.string().optional(),
});

export type CreateBookBody = SchemaType<typeof createBookBodySchema>;

export const createBookResponseCreatedBodySchema = Schema.object({
  book: bookSchema,
});

export type CreateBookResponseCreatedBody = SchemaType<typeof createBookResponseCreatedBodySchema>;
