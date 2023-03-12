import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { PaginationData } from '../../../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const findOrdersPayloadSchema = Schema.object({
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
  pagination: Schema.unsafeType<PaginationData>(),
});

export type FindOrdersPayload = SchemaType<typeof findOrdersPayloadSchema>;
