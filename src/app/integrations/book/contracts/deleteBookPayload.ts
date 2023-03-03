import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const deleteBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteBookPayload = SchemaType<typeof deleteBookPayloadSchema>;
