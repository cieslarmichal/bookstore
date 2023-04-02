import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Filter } from '../../../../../common/types/filter';
import { PaginationData } from '../../../../../common/types/paginationData';

export const findBooksPayloadSchema = Schema.object({
  filters: Schema.array(Schema.unsafeType<Filter>()),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindBooksPayload = SchemaType<typeof findBooksPayloadSchema>;
