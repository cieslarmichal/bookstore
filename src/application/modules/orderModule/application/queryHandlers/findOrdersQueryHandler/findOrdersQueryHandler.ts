import { FindOrdersQueryHandlerPayload } from './payloads/findOrdersQueryHandlerPayload';
import { FindOrdersQueryHandlerResult } from './payloads/findOrdersQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindOrdersQueryHandler = QueryHandler<FindOrdersQueryHandlerPayload, FindOrdersQueryHandlerResult>;
