import { FindAuthorsByBookIdQueryHandlerPayload } from './payloads/findAuthorsByBookIdQueryHandlerPayload';
import { FindAuthorsByBookIdQueryHandlerResult } from './payloads/findAuthorsByBookIdQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindAuthorsByBookIdQueryHandler = QueryHandler<
  FindAuthorsByBookIdQueryHandlerPayload,
  FindAuthorsByBookIdQueryHandlerResult
>;
