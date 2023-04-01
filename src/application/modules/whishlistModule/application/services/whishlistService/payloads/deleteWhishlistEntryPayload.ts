import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteWhishlistEntryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  whishlistEntryId: Schema.notEmptyString(),
});

export type DeleteWhishlistEntryPayload = SchemaType<typeof deleteWhishlistEntryPayloadSchema>;
