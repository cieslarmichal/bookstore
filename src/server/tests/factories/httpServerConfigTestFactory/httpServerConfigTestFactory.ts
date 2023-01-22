import { HttpServerConfig } from '../../../httpServerConfig';

export class HttpServerConfigTestFactory {
  public create(): HttpServerConfig {
    return {
      host: 'localhost',
      port: 3000,
    };
  }
}
