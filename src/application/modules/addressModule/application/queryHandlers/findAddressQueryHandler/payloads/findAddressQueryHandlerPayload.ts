import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAddressQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.string(),
});

export type FindAddressQueryHandlerPayload = SchemaType<typeof findAddressQueryHandlerPayloadSchema>;
