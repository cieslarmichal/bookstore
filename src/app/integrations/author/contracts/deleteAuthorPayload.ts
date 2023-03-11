import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const deleteAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteAuthorPayload = SchemaType<typeof deleteAuthorPayloadSchema>;
