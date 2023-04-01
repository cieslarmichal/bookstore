import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Cart } from '../../../../domain/entities/cart/cart';

export const validatePayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cart: Schema.instanceof(Cart),
  orderCreatorId: Schema.notEmptyString(),
});

export type ValidatePayload = SchemaType<typeof validatePayloadSchema>;
