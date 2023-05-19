import { FindInventoriesQueryHandlerPayload } from './payloads/findInventoriesQueryHandlerPayload';
import { FindInventoriesQueryHandlerResult } from './payloads/findInventoriesQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindInventoriesQueryHandler = QueryHandler<
  FindInventoriesQueryHandlerPayload,
  FindInventoriesQueryHandlerResult
>;
