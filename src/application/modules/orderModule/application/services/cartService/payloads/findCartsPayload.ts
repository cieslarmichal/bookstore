import { PaginationData } from '../../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartsPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  customerId: Schema.string(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindCartsPayload = SchemaType<typeof findCartsPayloadSchema>;
