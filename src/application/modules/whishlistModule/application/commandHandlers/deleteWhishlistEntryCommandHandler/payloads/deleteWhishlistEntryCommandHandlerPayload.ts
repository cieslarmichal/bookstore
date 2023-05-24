import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteWhishlistEntryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  whishlistEntryId: Schema.string(),
});

export type DeleteWhishlistEntryCommandHandlerPayload = SchemaType<
  typeof deleteWhishlistEntryCommandHandlerPayloadSchema
>;
