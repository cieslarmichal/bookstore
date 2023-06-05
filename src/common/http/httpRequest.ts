import { RequestContext } from './requestContext';

export interface HttpRequest<Body = unknown, QueryParams = unknown, PathParams = unknown> {
  readonly body: Body;
  readonly queryParams: QueryParams;
  readonly pathParams: PathParams;
  readonly context: RequestContext;
}
