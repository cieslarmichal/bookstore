import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
});

export type FindCartPayload = SchemaType<typeof findCartPayloadSchema>;
