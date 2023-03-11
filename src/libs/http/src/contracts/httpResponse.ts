import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';

export interface HttpResponse {
  readonly statusCode: HttpStatusCode;
  readonly body: unknown;
}
