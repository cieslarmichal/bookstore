import { FindAuthorsQueryHandlerPayload } from './payloads/findAuthorsQueryHandlerPayload';
import { FindAuthorsQueryHandlerResult } from './payloads/findAuthorsQueryHandlerResult';
import { QueryHandler } from '../../../../../../common/types/queryHandler';

export type FindAuthorsQueryHandler = QueryHandler<FindAuthorsQueryHandlerPayload, FindAuthorsQueryHandlerResult>;
