import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { WhishlistEntry } from '../../../../domain/entities/whishlistEntry/whishlistEntry';

export const findWhishlistEntriesQueryHandlerResultSchema = Schema.object({
  whishlistEntries: Schema.array(Schema.instanceof(WhishlistEntry)),
});

export type FindWhishlistEntriesQueryHandlerResult = SchemaType<typeof findWhishlistEntriesQueryHandlerResultSchema>;
