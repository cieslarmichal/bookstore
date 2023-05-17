import { FindBookQueryHandlerPayload } from './payloads/findBookQueryHandlerPayload';
import { FindBookQueryHandlerResult } from './payloads/findBookQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindBookQueryHandler = QueryHandler<FindBookQueryHandlerPayload, FindBookQueryHandlerResult>;
