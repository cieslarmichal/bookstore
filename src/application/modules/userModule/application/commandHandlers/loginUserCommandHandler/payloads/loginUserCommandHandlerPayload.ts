import { loginUserDraftSchema } from './loginUserDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserDraftSchema,
});

export type LoginUserCommandHandlerPayload = SchemaType<typeof loginUserCommandHandlerPayloadSchema>;
