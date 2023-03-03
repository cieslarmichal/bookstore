import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteUserPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.notEmptyString(),
});

export type DeleteUserPayload = SchemaType<typeof deleteUserPayloadSchema>;
