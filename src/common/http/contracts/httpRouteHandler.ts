import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';

export type HttpRouteHandler = (request: HttpRequest) => Promise<HttpResponse>;
