import { AccessTokenData } from '../../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { PaginationData } from '../../../../../../common/types/paginationData';

export const findOrdersPayloadSchema = Schema.object({
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindOrdersPayload = SchemaType<typeof findOrdersPayloadSchema>;
