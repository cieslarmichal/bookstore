import http, { RequestListener } from 'http';

import { HttpServerConfig } from './httpServerConfig';

export class HttpServer {
  public instance: http.Server;

  public constructor(listener: RequestListener, private readonly config: HttpServerConfig) {
    this.instance = http.createServer(listener);
  }

  public listen(): void {
    const { host, port } = this.config;

    this.instance.listen(port, host);
  }

  public close(): void {
    this.instance.close();
  }
}
