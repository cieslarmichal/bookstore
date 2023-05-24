import { FindWhishlistEntryQueryHandlerPayload } from './payloads/findWhishlistEntryQueryHandlerPayload';
import { FindWhishlistEntryQueryHandlerResult } from './payloads/findWhishlistEntryQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindWhishlistEntryQueryHandler = QueryHandler<
  FindWhishlistEntryQueryHandlerPayload,
  FindWhishlistEntryQueryHandlerResult
>;
