import { updateAddressDraftSchema } from './updateAddressDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
  draft: updateAddressDraftSchema,
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
