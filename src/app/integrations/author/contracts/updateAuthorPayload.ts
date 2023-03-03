import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const updateAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  about: Schema.notEmptyString(),
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
