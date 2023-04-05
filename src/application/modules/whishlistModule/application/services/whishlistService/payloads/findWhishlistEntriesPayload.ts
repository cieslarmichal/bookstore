import { PaginationData } from '../../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntriesPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  pagination: Schema.unsafeType<PaginationData>(),
  customerId: Schema.string(),
});

export type FindWhishlistEntriesPayload = SchemaType<typeof findWhishlistEntriesPayloadSchema>;
