import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { BookFormat } from '../../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../../domain/entities/book/bookLanguage';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  title: Schema.notEmptyString(),
  isbn: Schema.notEmptyString(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.notEmptyString().optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
