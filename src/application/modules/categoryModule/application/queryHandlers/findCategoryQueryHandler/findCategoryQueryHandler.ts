import { FindCategoryQueryHandlerPayload } from './payloads/findCategoryQueryHandlerPayload';
import { FindCategoryQueryHandlerResult } from './payloads/findCategoryQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindCategoryQueryHandler = QueryHandler<FindCategoryQueryHandlerPayload, FindCategoryQueryHandlerResult>;
