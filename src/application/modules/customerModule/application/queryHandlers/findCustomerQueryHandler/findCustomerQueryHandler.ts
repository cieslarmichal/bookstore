import { FindCustomerQueryHandlerPayload } from './payloads/findCustomerQueryHandlerPayload';
import { FindCustomerQueryHandlerResult } from './payloads/findCustomerQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindCustomerQueryHandler = QueryHandler<FindCustomerQueryHandlerPayload, FindCustomerQueryHandlerResult>;
