import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
