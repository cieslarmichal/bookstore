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
import { UserModule } from './app/domain/user/userModule';

export class App {
  public instance: express.Application;

  public constructor() {
    this.instance = express();
    this.setup();
  }

  private async setup() {
    ConfigLoader.loadConfig();

    this.instance.use(helmet());
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: false }));
    this.instance.use(jsonMiddleware);

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, UserModule, ControllersModule]);

    const bookController = container.resolve('bookController');
    const authorController = container.resolve('authorController');
    const userController = container.resolve('userController');

    this.instance.use('/', bookController.router);
    this.instance.use('/', authorController.router);
    this.instance.use('/', userController.router);

    this.instance.use(errorMiddleware);
  }
}
