import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
});

export type DeleteCartPayload = SchemaType<typeof deleteCartPayloadSchema>;
