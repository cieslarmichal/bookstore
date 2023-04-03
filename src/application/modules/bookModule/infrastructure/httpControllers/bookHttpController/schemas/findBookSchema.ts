import { bookSchema } from './bookSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findBookPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindBookPathParameters = SchemaType<typeof findBookPathParametersSchema>;

export const findBookResponseOkBodySchema = Schema.object({
  book: bookSchema,
});

export type FindBookResponseOkBody = SchemaType<typeof findBookResponseOkBodySchema>;
