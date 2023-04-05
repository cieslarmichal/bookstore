import { bookSchema } from './bookSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateBookPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateBookPathParameters = SchemaType<typeof updateBookPathParametersSchema>;

export const updateBookBodySchema = Schema.object({
  price: Schema.positiveNumber().optional(),
  description: Schema.string().optional(),
});

export type UpdateBookBody = SchemaType<typeof updateBookBodySchema>;

export const updateBookResponseOkBodySchema = Schema.object({
  book: bookSchema,
});

export type UpdateBookResponseOkBody = SchemaType<typeof updateBookResponseOkBodySchema>;
