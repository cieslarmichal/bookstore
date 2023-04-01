import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
});

export type DeleteCartPayload = SchemaType<typeof deleteCartPayloadSchema>;
