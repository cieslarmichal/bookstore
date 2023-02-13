import http, { RequestListener } from 'http';

import { HttpServerConfig } from './httpServerConfig';

export class HttpServer {
  public instance: http.Server;

  public constructor(listener: RequestListener, private readonly config: HttpServerConfig) {
    this.instance = http.createServer(listener);
  }

  public async listen(): Promise<void> {
    const { host, port } = this.config;

    return new Promise((resolve, reject) => {
      this.instance.listen(port, host).once('listening', resolve).once('error', reject);
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.instance.close().once('close', resolve).once('error', reject);
    });
  }
}
