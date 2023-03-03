import { Filter } from '../../../common/types/contracts/filter';
import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const findBooksByAuthorIdPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
  authorId: Schema.notEmptyString(),
});

export type FindBooksByAuthorIdPayload = SchemaType<typeof findBooksByAuthorIdPayloadSchema>;
