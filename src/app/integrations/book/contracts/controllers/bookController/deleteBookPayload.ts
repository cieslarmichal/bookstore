import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const deleteBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteBookPayload = SchemaType<typeof deleteBookPayloadSchema>;
