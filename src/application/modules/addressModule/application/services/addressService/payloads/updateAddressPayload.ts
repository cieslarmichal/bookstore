import { updateAddressDraftSchema } from './updateAddressDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.string(),
  draft: updateAddressDraftSchema,
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
