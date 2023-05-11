import { FindAddressesQueryHandlerPayload } from './payloads/findAddressesQueryHandlerPayload';
import { FindAddressesQueryHandlerResult } from './payloads/findAddressesQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindAddressesQueryHandler = QueryHandler<FindAddressesQueryHandlerPayload, FindAddressesQueryHandlerResult>;
