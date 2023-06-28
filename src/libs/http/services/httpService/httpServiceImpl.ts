import { stringify } from 'querystring';

import { HttpService } from './httpService';
import { HttpServiceConfig } from './httpServiceConfig';
import { SendRequestPayload, sendRequestPayloadSchema } from './payloads/sendRequestPayload';
import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
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

  public async sendRequest<HttpResponseBody>(input: SendRequestPayload): Promise<HttpResponse<HttpResponseBody>> {
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

      if (response.ok && response.status === HttpStatusCode.noContent) {
        return { body: null as HttpResponseBody, isSuccess: true, statusCode: HttpStatusCode.noContent };
      }

      const responseBody = await response.json();

      this.loggerService.debug({
        message: 'Http request sent.',
        context: { responseBody, statusCode: response.status },
      });

      if (!response.ok) {
        return { body: responseBody, statusCode: response.status, isSuccess: false };
      }

      return { body: responseBody as HttpResponseBody, statusCode: response.status, isSuccess: true };
    } catch (error) {
      const { name, message } = error instanceof Error ? error : { name: '', message: JSON.stringify(error) };

      throw new HttpServiceError({ name, message });
    }
  }
}
