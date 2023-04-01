import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.notEmptyString(),
  email: Schema.notEmptyString(),
});

export type SetUserEmailPayload = SchemaType<typeof setUserEmailPayloadSchema>;
