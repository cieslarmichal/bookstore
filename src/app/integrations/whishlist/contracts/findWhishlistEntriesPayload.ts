import { PaginationData } from '../../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';

export const findWhishlistEntriesPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  customerId: Schema.notEmptyString(),
});

export type FindWhishlistEntriesPayload = SchemaType<typeof findWhishlistEntriesPayloadSchema>;
