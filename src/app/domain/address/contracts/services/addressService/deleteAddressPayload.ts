import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const deleteAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
