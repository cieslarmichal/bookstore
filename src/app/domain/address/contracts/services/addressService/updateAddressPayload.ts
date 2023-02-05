import { updateAddressDraftSchema } from './updateAddressDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
  draft: updateAddressDraftSchema,
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
