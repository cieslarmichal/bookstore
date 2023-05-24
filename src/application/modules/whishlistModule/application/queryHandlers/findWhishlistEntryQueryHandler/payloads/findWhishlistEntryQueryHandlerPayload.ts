import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntryQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  whishlistEntryId: Schema.string(),
});

export type FindWhishlistEntryQueryHandlerPayload = SchemaType<typeof findWhishlistEntryQueryHandlerPayloadSchema>;
