import { PaginationData } from '../../../../../../../common/types/paginationData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoriesPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  bookId: Schema.string().optional(),
});

export type FindInventoriesPayload = SchemaType<typeof findInventoriesPayloadSchema>;
