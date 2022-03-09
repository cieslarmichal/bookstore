import express from 'express';
import { errorMiddleware } from './app/middlewares';
import helmet from 'helmet';
import { jsonMiddleware } from './app/middlewares/jsonMiddleware';
import { AwilixContainer } from 'awilix';

export class App {
  public instance: express.Application;

  public constructor(private readonly container: AwilixContainer) {
    this.instance = express();
    this.setup();
  }

  private async setup() {
    this.instance.use(helmet());
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: false }));
    this.instance.use(jsonMiddleware);

    const bookController = this.container.resolve('bookController');
    const authorController = this.container.resolve('authorController');
    const userController = this.container.resolve('userController');

    this.instance.use('/', bookController.router);
    this.instance.use('/', authorController.router);
    this.instance.use('/', userController.router);

    this.instance.use(errorMiddleware);
  }
}
