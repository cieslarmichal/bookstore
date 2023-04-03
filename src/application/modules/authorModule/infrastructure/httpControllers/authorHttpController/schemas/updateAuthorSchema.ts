import { authorSchema } from './authorSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAuthorPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateAuthorPathParameters = SchemaType<typeof updateAuthorPathParametersSchema>;

export const updateAuthorBodySchema = Schema.object({
  about: Schema.notEmptyString(),
});

export type UpdateAuthorBody = SchemaType<typeof updateAuthorBodySchema>;

export const updateAuthorResponseOkBodySchema = Schema.object({
  author: authorSchema,
});

export type UpdateAuthorResponseOkBody = SchemaType<typeof updateAuthorResponseOkBodySchema>;
