import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { PaginationData } from '../../../../../common/types/paginationData';

export const findWhishlistEntriesPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  customerId: Schema.notEmptyString(),
});

export type FindWhishlistEntriesPayload = SchemaType<typeof findWhishlistEntriesPayloadSchema>;
