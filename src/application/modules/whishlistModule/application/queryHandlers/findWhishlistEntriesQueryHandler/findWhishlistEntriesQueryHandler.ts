import { FindWhishlistEntriesQueryHandlerPayload } from './payloads/findWhishlistEntriesQueryHandlerPayload';
import { FindWhishlistEntriesQueryHandlerResult } from './payloads/findWhishlistEntriesQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindWhishlistEntriesQueryHandler = QueryHandler<
  FindWhishlistEntriesQueryHandlerPayload,
  FindWhishlistEntriesQueryHandlerResult
>;
