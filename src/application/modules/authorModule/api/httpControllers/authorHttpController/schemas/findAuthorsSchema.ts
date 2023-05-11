import { authorSchema } from './authorSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAuthorsQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  filter: Schema.unknown().optional(),
});

export type FindAuthorsQueryParameters = SchemaType<typeof findAuthorsQueryParametersSchema>;

export const findAuthorsResponseOkBodySchema = Schema.object({
  data: Schema.array(authorSchema),
});

export type FindAuthorsResponseOkBody = SchemaType<typeof findAuthorsResponseOkBodySchema>;
