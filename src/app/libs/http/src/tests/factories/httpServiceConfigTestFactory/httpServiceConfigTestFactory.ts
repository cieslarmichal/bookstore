import { faker } from '@faker-js/faker';

import { HttpHeader } from '../../../../../../common/http/contracts/httpHeader';
import { HttpMediaType } from '../../../../../../common/http/contracts/httpMediaType';
import { Validator } from '../../../../../validator/implementations/validator';
import { HttpServiceConfig, httpServiceConfigSchema } from '../../../contracts/services/httpService/httpServiceConfig';

export class HttpServiceConfigTestFactory {
  public create(input: Partial<HttpServiceConfig> = {}): HttpServiceConfig {
    return Validator.validate(httpServiceConfigSchema, {
      baseUrl: faker.internet.url(),
      headers: {
        [HttpHeader.contentType]: HttpMediaType.applicationJson,
        [HttpHeader.accept]: HttpMediaType.applicationJson,
      },
      ...input,
    });
  }
}
