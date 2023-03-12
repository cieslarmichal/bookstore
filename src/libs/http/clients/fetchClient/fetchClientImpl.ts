import fetch, { Response } from 'node-fetch';

import { FetchClient } from './fetchClient';
import { FetchPayload, fetchPayloadSchema } from './payloads/fetchPayload';
import { Injectable } from '../../../dependencyInjection/decorators';
import { Validator } from '../../../validator/validator';

@Injectable()
export class FetchClientImpl implements FetchClient {
  public async fetch(input: FetchPayload): Promise<Response> {
    const { url, init } = Validator.validate(fetchPayloadSchema, input);

    return fetch(url, init);
  }
}
