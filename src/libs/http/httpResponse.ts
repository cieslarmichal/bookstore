import { HttpStatusCode } from '../../common/http/httpStatusCode';

export interface HttpResponse {
  readonly statusCode: HttpStatusCode;
  readonly body: unknown;
}
