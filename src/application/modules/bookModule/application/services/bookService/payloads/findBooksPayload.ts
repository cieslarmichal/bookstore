import { Filter } from '../../../../../../common/types/filter';
import { PaginationData } from '../../../../../../common/types/paginationData';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findBooksPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindBooksPayload = SchemaType<typeof findBooksPayloadSchema>;
