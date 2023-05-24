import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { WhishlistEntry } from '../../../../domain/entities/whishlistEntry/whishlistEntry';

export const findWhishlistEntryQueryHandlerResultSchema = Schema.object({
  whishlistEntry: Schema.instanceof(WhishlistEntry),
});

export type FindWhishlistEntryQueryHandlerResult = SchemaType<typeof findWhishlistEntryQueryHandlerResultSchema>;
