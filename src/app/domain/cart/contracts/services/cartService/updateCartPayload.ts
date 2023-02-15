import { updateCartDraftSchema } from './updateCartDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: updateCartDraftSchema,
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
