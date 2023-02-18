import { addLineItemDraftSchema } from './addLineItemDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const addLineItemPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: addLineItemDraftSchema,
});

export type AddLineItemPayload = SchemaType<typeof addLineItemPayloadSchema>;
