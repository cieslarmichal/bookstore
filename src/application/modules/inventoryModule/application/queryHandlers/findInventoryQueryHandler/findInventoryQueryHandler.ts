import { FindInventoryQueryHandlerPayload } from './payloads/findInventoryQueryHandlerPayload';
import { FindInventoryQueryHandlerResult } from './payloads/findInventoryQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindInventoryQueryHandler = QueryHandler<FindInventoryQueryHandlerPayload, FindInventoryQueryHandlerResult>;
