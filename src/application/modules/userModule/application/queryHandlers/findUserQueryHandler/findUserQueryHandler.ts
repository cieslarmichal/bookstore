import { FindUserQueryHandlerPayload } from './payloads/findUserQueryHandlerPayload';
import { FindUserQueryHandlerResult } from './payloads/findUserQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindUserQueryHandler = QueryHandler<FindUserQueryHandlerPayload, FindUserQueryHandlerResult>;
