import { Filter } from '../../../common/types/contracts/filter';
import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const findCategoriesByBookIdPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  bookId: Schema.notEmptyString(),
});

export type FindCategoriesByBookIdPayload = SchemaType<typeof findCategoriesByBookIdPayloadSchema>;
