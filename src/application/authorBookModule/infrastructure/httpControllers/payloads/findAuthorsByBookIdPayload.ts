import { Filter } from '../../../../../common/types/filter';
import { PaginationData } from '../../../../../common/types/paginationData';
import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const findAuthorsByBookIdPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  bookId: Schema.notEmptyString(),
});

export type FindAuthorsByBookIdPayload = SchemaType<typeof findAuthorsByBookIdPayloadSchema>;
