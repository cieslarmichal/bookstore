import { whishlistEntrySchema } from './whishlistEntrySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntriesQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
});

export type FindWhishlistEntriesQueryParameters = SchemaType<typeof findWhishlistEntriesQueryParametersSchema>;

export const findWhishlistEntriesResponseOkBodySchema = Schema.object({
  data: Schema.array(whishlistEntrySchema),
});

export type FindWhishlistEntriesResponseOkBody = SchemaType<typeof findWhishlistEntriesResponseOkBodySchema>;
