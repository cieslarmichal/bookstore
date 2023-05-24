import { FindReviewQueryHandlerPayload } from './payloads/findReviewQueryHandlerPayload';
import { FindReviewQueryHandlerResult } from './payloads/findReviewQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindReviewQueryHandler = QueryHandler<FindReviewQueryHandlerPayload, FindReviewQueryHandlerResult>;
