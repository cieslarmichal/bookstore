import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  whishlistEntryId: Schema.notEmptyString(),
});

export type FindWhishlistEntryPayload = SchemaType<typeof findWhishlistEntryPayloadSchema>;
