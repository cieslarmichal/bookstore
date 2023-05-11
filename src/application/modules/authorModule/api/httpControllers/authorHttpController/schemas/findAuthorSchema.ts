import { authorSchema } from './authorSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAuthorPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindAuthorPathParameters = SchemaType<typeof findAuthorPathParametersSchema>;

export const findAuthorResponseOkBodySchema = Schema.object({
  author: authorSchema,
});

export type FindAuthorResponseOkBody = SchemaType<typeof findAuthorResponseOkBodySchema>;
