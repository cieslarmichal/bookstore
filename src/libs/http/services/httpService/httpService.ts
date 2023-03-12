import { SendRequestPayload } from './payloads/sendRequestPayload';
import { HttpResponse } from '../../httpResponse';

export interface HttpService {
  sendRequest(input: SendRequestPayload): Promise<HttpResponse>;
}
