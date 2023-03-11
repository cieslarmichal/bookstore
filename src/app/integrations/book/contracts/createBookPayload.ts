import { BookFormat } from '../../../domain/book/contracts/bookFormat';
import { BookLanguage } from '../../../domain/book/contracts/bookLanguage';
import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

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
