import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
