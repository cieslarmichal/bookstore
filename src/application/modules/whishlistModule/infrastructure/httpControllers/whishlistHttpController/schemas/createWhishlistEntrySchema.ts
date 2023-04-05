import { whishlistEntrySchema } from './whishlistEntrySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createWhishlistEntryBodySchema = Schema.object({
  bookId: Schema.notEmptyString(),
});

export type CreateWhishlistEntryBody = SchemaType<typeof createWhishlistEntryBodySchema>;

export const createWhishlistEntryResponseCreatedBodySchema = Schema.object({
  whishlistEntry: whishlistEntrySchema,
});

export type CreateWhishlistEntryResponseCreatedBody = SchemaType<typeof createWhishlistEntryResponseCreatedBodySchema>;
