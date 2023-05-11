import { FindAuthorQueryHandlerPayload } from './payloads/findAuthorQueryHandlerPayload';
import { FindAuthorQueryHandlerResult } from './payloads/findAuthorQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindAuthorQueryHandler = QueryHandler<FindAuthorQueryHandlerPayload, FindAuthorQueryHandlerResult>;
