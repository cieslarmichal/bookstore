import { FindCartQueryHandlerPayload } from './payloads/findCartQueryHandlerPayload';
import { FindCartQueryHandlerResult } from './payloads/findCartQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindCartQueryHandler = QueryHandler<FindCartQueryHandlerPayload, FindCartQueryHandlerResult>;
