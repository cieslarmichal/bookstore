import { authorSchema } from './authorSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorBodySchema = Schema.object({
  firstName: Schema.string(),
  lastName: Schema.string(),
  about: Schema.string().optional(),
});

export type CreateAuthorBody = SchemaType<typeof createAuthorBodySchema>;

export const createAuthorResponseCreatedBodySchema = Schema.object({
  author: authorSchema,
});

export type CreateAuthorResponseCreatedBody = SchemaType<typeof createAuthorResponseCreatedBodySchema>;
