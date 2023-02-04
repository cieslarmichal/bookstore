import { HttpServerConfig } from '../../../httpServerConfig';

export class HttpServerConfigTestFactory {
  public create(input: Partial<HttpServerConfig> = {}): HttpServerConfig {
    return {
      host: 'localhost',
      port: 3000,
      ...input,
    };
  }
}
