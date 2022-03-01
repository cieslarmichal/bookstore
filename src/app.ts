import express from 'express';
import { errorMiddleware } from './app/middlewares';
import { ConfigLoader } from './app/config';
import { createDIContainer } from './app/shared';
import { BookModule } from './app/domain/book/bookModule';
import { AuthorModule } from './app/domain/author/authorModule';
import { DbModule } from './app/shared/db/dbModule';
import { ControllersModule } from './app/controllers/controllersModule';
import helmet from 'helmet';
import { jsonMiddleware } from './app/middlewares/jsonMiddleware';

export class App {
  public expressApp: express.Application;

  public constructor() {
    this.expressApp = express();
    this.setup();
  }

  private async setup() {
    ConfigLoader.loadConfig();

    this.expressApp.use(helmet());
    this.expressApp.use(express.json());
    this.expressApp.use(express.urlencoded({ extended: false }));
    this.expressApp.use(jsonMiddleware);

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    const bookController = container.resolve('bookController');
    const authorController = container.resolve('authorController');

    this.expressApp.use('/', bookController.router);
    this.expressApp.use('/', authorController.router);

    this.expressApp.use(errorMiddleware);
  }
}
