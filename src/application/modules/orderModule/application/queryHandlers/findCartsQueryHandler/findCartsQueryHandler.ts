import { FindCartsQueryHandlerPayload } from './payloads/findCartsQueryHandlerPayload';
import { FindCartsQueryHandlerResult } from './payloads/findCartsQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindCartsQueryHandler = QueryHandler<FindCartsQueryHandlerPayload, FindCartsQueryHandlerResult>;
