import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  about: Schema.notEmptyString(),
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
