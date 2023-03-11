import { loginUserByEmailDraftSchema } from './loginUserByEmailDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const loginUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByEmailDraftSchema,
});

export type LoginUserByEmailPayload = SchemaType<typeof loginUserByEmailPayloadSchema>;
