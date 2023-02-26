import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findInventoriesPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindInventoriesPayload = SchemaType<typeof findInventoriesPayloadSchema>;
