import { FindReviewsQueryHandlerPayload } from './payloads/findReviewsQueryHandlerPayload';
import { FindReviewsQueryHandlerResult } from './payloads/findReviewsQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindReviewsQueryHandler = QueryHandler<FindReviewsQueryHandlerPayload, FindReviewsQueryHandlerResult>;
