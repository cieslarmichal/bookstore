import { registerUserByEmailDraftSchema } from './registerUserByEmailDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const registerUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByEmailDraftSchema,
});

export type RegisterUserByEmailPayload = SchemaType<typeof registerUserByEmailPayloadSchema>;
