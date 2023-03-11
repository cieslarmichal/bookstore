import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const findWhishlistEntryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  whishlistEntryId: Schema.notEmptyString(),
});

export type FindWhishlistEntryPayload = SchemaType<typeof findWhishlistEntryPayloadSchema>;
