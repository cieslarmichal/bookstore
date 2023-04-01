import { loginUserByEmailDraftSchema } from './loginUserByEmailDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const loginUserByEmailPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByEmailDraftSchema,
});

export type LoginUserByEmailPayload = SchemaType<typeof loginUserByEmailPayloadSchema>;
