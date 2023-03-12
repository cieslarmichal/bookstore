import { stringify } from 'querystring';

import { HttpService } from './httpService';
import { HttpServiceConfig } from './httpServiceConfig';
import { SendRequestPayload, sendRequestPayloadSchema } from './payloads/sendRequestPayload';
import { LoggerService } from '../../../logger/services/loggerService/loggerService';
import { Validator } from '../../../validator/validator';
import { FetchClient } from '../../clients/fetchClient/fetchClient';
import { HttpServiceError } from '../../errors/httpServiceError';
import { HttpResponse } from '../../httpResponse';

export class HttpServiceImpl implements HttpService {
  public constructor(
    private readonly config: HttpServiceConfig,
    private readonly fetchClient: FetchClient,
    private readonly loggerService: LoggerService,
  ) {}

  public async sendRequest(input: SendRequestPayload): Promise<HttpResponse> {
    const {
      endpoint,
      headers: requestHeaders,
      queryParams,
      method,
      body: requestBody,
    } = Validator.validate(sendRequestPayloadSchema, input);

    const { headers: defaultHeaders = {}, baseUrl } = this.config;

    const headers = { ...defaultHeaders, ...requestHeaders };

    const body = JSON.stringify(requestBody);

    let url = `${baseUrl}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length) {
      url += `?${stringify(queryParams)}`;
    }

    this.loggerService.debug({ message: 'Sending http request...', context: { url, method, body, headers } });

    try {
      const response = await this.fetchClient.fetch({
        url,
        init: {
          method,
          headers: headers as never,
          body,
        },
      });

      const responseBody = await response.json();

      this.loggerService.debug({
        message: 'Http request sent.',
        context: { responseBody, statusCode: response.status },
      });

      return { body: responseBody, statusCode: response.status };
    } catch (error) {
      const { name, message } = error instanceof Error ? error : { name: '', message: JSON.stringify(error) };

      throw new HttpServiceError({ name, message });
    }
  }
}
