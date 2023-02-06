import { loginUserByEmailDraftSchema } from './loginUserByEmailDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const loginUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByEmailDraftSchema,
});

export type LoginUserByEmailPayload = SchemaType<typeof loginUserByEmailPayloadSchema>;
