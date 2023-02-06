import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UserRole } from '../../userRole';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  password: Schema.notEmptyString(),
  role: Schema.enum(UserRole),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
