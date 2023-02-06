import { Filter } from '../../../common/types/contracts/filter';
import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findAuthorsByBookIdPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  bookId: Schema.notEmptyString(),
});

export type FindAuthorsByBookIdPayload = SchemaType<typeof findAuthorsByBookIdPayloadSchema>;