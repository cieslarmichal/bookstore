import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserPasswordPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type SetUserPasswordPayload = SchemaType<typeof setUserPasswordPayloadSchema>;
