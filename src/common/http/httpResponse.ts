import { HttpStatusCode } from './httpStatusCode';
import { Schema } from '../../libs/validator/schema';

export const httpResponseSchema = Schema.object({
  statusCode: Schema.enum(HttpStatusCode),
  body: Schema.union([Schema.null(), Schema.record(Schema.string(), Schema.any())]),
});

export interface HttpResponse<Body = unknown> {
  readonly statusCode: HttpStatusCode;
  readonly body: Body;
}

export interface HttpOkResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.ok;
}

export interface HttpCreatedResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.created;
}

export interface HttpNoContentResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.noContent;
}

export interface HttpNotFoundResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.notFound;
}

export interface HttpBadRequestResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.badRequest;
}
