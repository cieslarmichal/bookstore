import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { BookFormat } from '../../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../../domain/entities/book/bookLanguage';

export const createBookPayloadSchema = Schema.object({
  id: Schema.string(),
  title: Schema.string(),
  isbn: Schema.string(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.string().optional(),
});

export type CreateBookPayload = SchemaType<typeof createBookPayloadSchema>;
