import { Filter } from '../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const findBooksByCategoryIdPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  categoryId: Schema.notEmptyString(),
});

export type FindBooksByCategoryIdPayload = SchemaType<typeof findBooksByCategoryIdPayloadSchema>;
