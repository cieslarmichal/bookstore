import { registerUserByEmailDraftSchema } from './registerUserByEmailDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const registerUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByEmailDraftSchema,
});

export type RegisterUserByEmailPayload = SchemaType<typeof registerUserByEmailPayloadSchema>;
