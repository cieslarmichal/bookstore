import { Response } from 'node-fetch';

import { FetchPayload } from './fetchPayload';

export interface FetchClient {
  fetch(input: FetchPayload): Promise<Response>;
}
