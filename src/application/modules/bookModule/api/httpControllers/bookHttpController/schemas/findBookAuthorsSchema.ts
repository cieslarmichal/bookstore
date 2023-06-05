import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { authorSchema } from '../../../../../authorModule/api/httpControllers/authorHttpController/schemas/authorSchema';

export const findBookAuthorsPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindBookAuthorsPathParameters = SchemaType<typeof findBookAuthorsPathParametersSchema>;

export const findBookAuthorsQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  filter: Schema.unknown().optional(),
});

export type FindBookAuthorsQueryParameters = SchemaType<typeof findBookAuthorsQueryParametersSchema>;

export const findBookAuthorsResponseOkBodySchema = Schema.object({
  data: Schema.array(authorSchema),
});

export type FindBookAuthorsResponseOkBody = SchemaType<typeof findBookAuthorsResponseOkBodySchema>;
