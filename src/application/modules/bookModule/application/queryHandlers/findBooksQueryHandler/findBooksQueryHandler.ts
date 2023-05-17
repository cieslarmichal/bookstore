import { FindBooksQueryHandlerPayload } from './payloads/findBooksQueryHandlerPayload';
import { FindBooksQueryHandlerResult } from './payloads/findBooksQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindBooksQueryHandler = QueryHandler<FindBooksQueryHandlerPayload, FindBooksQueryHandlerResult>;
