import { PaginationData } from '../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoriesPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindInventoriesPayload = SchemaType<typeof findInventoriesPayloadSchema>;
