import { PaginationData } from '../../../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const findInventoriesPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindInventoriesPayload = SchemaType<typeof findInventoriesPayloadSchema>;
