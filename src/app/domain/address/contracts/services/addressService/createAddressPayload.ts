import { createAddressDraftSchema } from './createAddressDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAddressDraftSchema,
});

export type CreateAddressPayload = SchemaType<typeof createAddressPayloadSchema>;
