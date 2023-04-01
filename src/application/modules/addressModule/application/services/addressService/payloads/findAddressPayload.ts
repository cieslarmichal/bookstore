import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findAddressPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.notEmptyString(),
});

export type FindAddressPayload = SchemaType<typeof findAddressPayloadSchema>;
