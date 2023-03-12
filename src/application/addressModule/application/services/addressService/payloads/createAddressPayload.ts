import { createAddressDraftSchema } from './createAddressDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAddressDraftSchema,
});

export type CreateAddressPayload = SchemaType<typeof createAddressPayloadSchema>;
