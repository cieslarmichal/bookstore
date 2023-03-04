import { HttpRequest } from './httpRequest.js';
import { HttpResponse } from './httpResponse.js';

export type HttpRouteHandler = (request: HttpRequest) => Promise<HttpResponse>;
