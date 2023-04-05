import { whishlistEntrySchema } from './whishlistEntrySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntriesQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
});

export type FindWhishlistEntriesQueryParameters = SchemaType<typeof findWhishlistEntriesQueryParametersSchema>;

export const findWhishlistEntriesResponseOkBodySchema = Schema.object({
  data: Schema.array(whishlistEntrySchema),
});

export type FindWhishlistEntriesResponseOkBody = SchemaType<typeof findWhishlistEntriesResponseOkBodySchema>;
