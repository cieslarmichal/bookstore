import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAddressCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  addressId: Schema.string(),
});

export type DeleteAddressCommandHandlerPayload = SchemaType<typeof deleteAddressCommandHandlerPayloadSchema>;
