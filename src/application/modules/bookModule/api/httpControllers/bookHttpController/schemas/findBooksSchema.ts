import { bookSchema } from './bookSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findBooksQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  filter: Schema.unknown().optional(),
});

export type FindBooksQueryParameters = SchemaType<typeof findBooksQueryParametersSchema>;

export const findBooksResponseOkBodySchema = Schema.object({
  data: Schema.array(bookSchema),
});

export type FindBooksResponseOkBody = SchemaType<typeof findBooksResponseOkBodySchema>;
