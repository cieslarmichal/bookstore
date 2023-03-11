import fetch, { Response } from 'node-fetch';

import { Injectable } from '../../../../../dependencyInjection/contracts/decorators';
import { Validator } from '../../../../../validator/implementations/validator';
import { FetchClient } from '../../../contracts/clients/fetchClient/fetchClient';
import { FetchPayload, fetchPayloadSchema } from '../../../contracts/clients/fetchClient/fetchPayload';

@Injectable()
export class FetchClientImpl implements FetchClient {
  public async fetch(input: FetchPayload): Promise<Response> {
    const { url, init } = Validator.validate(fetchPayloadSchema, input);

    return fetch(url, init);
  }
}
