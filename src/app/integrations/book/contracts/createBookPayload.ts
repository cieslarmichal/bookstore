import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { BookFormat } from '../../../domain/book/contracts/bookFormat';
import { BookLanguage } from '../../../domain/book/contracts/bookLanguage';

export const createBookPayloadSchema = Schema.object({
  title: Schema.notEmptyString(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.notEmptyString().optional(),
});

export type CreateBookPayload = SchemaType<typeof createBookPayloadSchema>;
