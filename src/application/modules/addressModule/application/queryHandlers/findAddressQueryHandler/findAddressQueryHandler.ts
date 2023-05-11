import { FindAddressQueryHandlerPayload } from './payloads/findAddressQueryHandlerPayload';
import { FindAddressQueryHandlerResult } from './payloads/findAddressQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindAddressQueryHandler = QueryHandler<FindAddressQueryHandlerPayload, FindAddressQueryHandlerResult>;
