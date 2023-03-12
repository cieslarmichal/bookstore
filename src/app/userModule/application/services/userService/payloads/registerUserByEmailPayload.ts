import { registerUserByEmailDraftSchema } from './registerUserByEmailDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const registerUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByEmailDraftSchema,
});

export type RegisterUserByEmailPayload = SchemaType<typeof registerUserByEmailPayloadSchema>;
