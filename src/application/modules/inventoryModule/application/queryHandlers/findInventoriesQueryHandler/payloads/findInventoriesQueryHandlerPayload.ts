import { PaginationData } from '../../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoriesQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  pagination: Schema.unsafeType<PaginationData>(),
  bookId: Schema.string().optional(),
});

export type FindInventoriesQueryHandlerPayload = SchemaType<typeof findInventoriesQueryHandlerPayloadSchema>;
