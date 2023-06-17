import { SendRequestPayload } from './payloads/sendRequestPayload';
import { HttpResponse } from '../../httpResponse';

export interface HttpService {
  sendRequest<HttpResponseBody>(input: SendRequestPayload): Promise<HttpResponse<HttpResponseBody>>;
}
