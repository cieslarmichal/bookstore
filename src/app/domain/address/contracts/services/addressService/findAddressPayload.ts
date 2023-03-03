import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const findAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
});

export type FindAddressPayload = SchemaType<typeof findAddressPayloadSchema>;
