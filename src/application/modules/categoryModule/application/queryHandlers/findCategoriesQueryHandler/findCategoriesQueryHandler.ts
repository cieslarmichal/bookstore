import { FindCategoriesQueryHandlerPayload } from './payloads/findCategoriesQueryHandlerPayload';
import { FindCategoriesQueryHandlerResult } from './payloads/findCategoriesQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindCategoriesQueryHandler = QueryHandler<
  FindCategoriesQueryHandlerPayload,
  FindCategoriesQueryHandlerResult
>;
