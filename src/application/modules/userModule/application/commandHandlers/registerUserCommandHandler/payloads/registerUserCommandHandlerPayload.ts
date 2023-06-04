import { registerUserDraftSchema } from './registerUserDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const registerUserCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserDraftSchema,
});

export type RegisterUserCommandHandlerPayload = SchemaType<typeof registerUserCommandHandlerPayloadSchema>;
