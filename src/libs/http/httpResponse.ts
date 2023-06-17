import { HttpStatusCode } from '../../common/http/httpStatusCode';

export interface HttpSuccessResponse<HttpSuccessResponseBody> {
  readonly isSuccess: true;
  readonly statusCode: HttpStatusCode;
  readonly body: HttpSuccessResponseBody;
}

export interface HttpErrorResponse<HttpErrorResponseBody> {
  readonly statusCode: HttpStatusCode;
  readonly isSuccess: false;
  readonly body: HttpErrorResponseBody;
}

export type HttpResponse<HttpSuccessResponseBody = unknown, HttpErrorResponseBody = unknown> =
  | HttpSuccessResponse<HttpSuccessResponseBody>
  | HttpErrorResponse<HttpErrorResponseBody>;
