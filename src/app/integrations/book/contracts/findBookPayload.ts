import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type FindBookPayload = SchemaType<typeof findBookPayloadSchema>;
