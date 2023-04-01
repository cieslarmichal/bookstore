import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { UserRole } from '../../../../domain/entities/user/userRole';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  password: Schema.notEmptyString(),
  role: Schema.enum(UserRole),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
