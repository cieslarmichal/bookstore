import { createAddressDraftSchema } from './createAddressDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAddressDraftSchema,
});

export type CreateAddressPayload = SchemaType<typeof createAddressPayloadSchema>;
