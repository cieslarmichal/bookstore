import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { BookFormat } from '../../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../../domain/entities/book/bookLanguage';

export const createBookDraftSchema = Schema.object({
  title: Schema.notEmptyString(),
  isbn: Schema.notEmptyString(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.notEmptyString().optional(),
});

export type CreateBookDraft = SchemaType<typeof createBookDraftSchema>;