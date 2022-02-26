import express from 'express';
import { errorMiddleware, routeNotFoundMiddleware } from './app/middlewares';
import { ConfigLoader } from './app/config';
import http from 'http';
import { createDIContainer } from './app/shared';
import { BookModule } from './app/domain/book/bookModule';
import { AuthorModule } from './app/domain/author/authorModule';
import { DbModule } from './app/shared/db/dbModule';
import { ControllersModule } from './app/controllers/controllersModule';

export class App {
  private app: express.Application;
  public server: http.Server;

  public constructor() {
    this.app = express();
    this.setup();
  }

  private async setup() {
    ConfigLoader.loadConfig();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    const bookController = container.resolve('bookController');
    const authorController = container.resolve('authorController');

    this.app.use('/', bookController.router);
    this.app.use('/', authorController.router);

    this.app.use(routeNotFoundMiddleware);
    this.app.use(errorMiddleware);
  }

  public run() {
    const httpPort = process.env.HTTP_PORT;

    this.server = this.app.listen(httpPort, () => {
      console.log(`Server running on port ${httpPort}`);
    });
  }

  public stop() {
    this.server.close();
  }
}