import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const findAuthorPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindAuthorPayload = SchemaType<typeof findAuthorPayloadSchema>;
