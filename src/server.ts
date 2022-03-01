import http, { RequestListener } from 'http';

export class Server {
  public server: http.Server;

  public constructor(listener: RequestListener) {
    this.server = http.createServer(listener);
  }

  public listen() {
    const httpPort = parseInt(process.env.HTTP_PORT as string);

    this.server.listen(httpPort, () => {
      console.log(`Server running on port ${httpPort}`);
    });
  }

  public close() {
    this.server.close();
  }
}
