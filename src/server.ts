import http, { RequestListener } from 'http';

export class Server {
  public instance: http.Server;

  public constructor(listener: RequestListener) {
    this.instance = http.createServer(listener);
  }

  public listen() {
    const httpPort = parseInt(process.env.HTTP_PORT as string);

    this.instance.listen(httpPort, () => {
      console.log(`Server running on port ${httpPort}`);
    });
  }

  public close() {
    this.instance.close();
  }
}
