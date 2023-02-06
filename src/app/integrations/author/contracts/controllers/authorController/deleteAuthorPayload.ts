import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const deleteAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteAuthorPayload = SchemaType<typeof deleteAuthorPayloadSchema>;
