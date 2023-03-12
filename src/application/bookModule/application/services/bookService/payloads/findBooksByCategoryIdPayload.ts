import { Filter } from '../../../../../../common/types/contracts/filter';
import { PaginationData } from '../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findBooksByCategoryIdPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  categoryId: Schema.notEmptyString(),
});

export type FindBooksByCategoryIdPayload = SchemaType<typeof findBooksByCategoryIdPayloadSchema>;
