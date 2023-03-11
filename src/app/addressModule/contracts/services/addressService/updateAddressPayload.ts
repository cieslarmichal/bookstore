import { updateAddressDraftSchema } from './updateAddressDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
  draft: updateAddressDraftSchema,
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
