import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { BookFormat } from '../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../domain/entities/book/bookLanguage';

export const createBookPayloadSchema = Schema.object({
  title: Schema.notEmptyString(),
  isbn: Schema.notEmptyString(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.notEmptyString().optional(),
});

export type CreateBookPayload = SchemaType<typeof createBookPayloadSchema>;
