import { Response } from 'node-fetch';

import { FetchPayload } from './payloads/fetchPayload';

export interface FetchClient {
  fetch(input: FetchPayload): Promise<Response>;
}
