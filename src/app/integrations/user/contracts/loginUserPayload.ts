import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const loginUserPayloadSchema = Schema.object({
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  password: Schema.notEmptyString(),
});

export type LoginUserPayload = SchemaType<typeof loginUserPayloadSchema>;
