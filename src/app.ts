import express from 'express';
import helmet from 'helmet';
import { errorMiddleware } from './app/middlewares';
import { jsonMiddleware } from './app/middlewares/jsonMiddleware';
import { AwilixContainer } from 'awilix';
import {
  ADDRESS_CONTROLLER,
  AUTHOR_BOOK_CONTROLLER,
  AUTHOR_CONTROLLER,
  BOOK_CATEGORY_CONTROLLER,
  BOOK_CONTROLLER,
  CATEGORY_CONTROLLER,
  USER_CONTROLLER,
} from './app/controllers/controllersInjectionSymbols';

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

    const bookController = this.container.resolve(BOOK_CONTROLLER);
    const authorController = this.container.resolve(AUTHOR_CONTROLLER);
    const userController = this.container.resolve(USER_CONTROLLER);
    const categoryController = this.container.resolve(CATEGORY_CONTROLLER);
    const authorBookController = this.container.resolve(AUTHOR_BOOK_CONTROLLER);
    const bookCategoryController = this.container.resolve(BOOK_CATEGORY_CONTROLLER);
    const addressController = this.container.resolve(ADDRESS_CONTROLLER);

    this.instance.use('/', bookController.router);
    this.instance.use('/', authorController.router);
    this.instance.use('/', userController.router);
    this.instance.use('/', categoryController.router);
    this.instance.use('/', authorBookController.router);
    this.instance.use('/', bookCategoryController.router);
    this.instance.use('/', addressController.router);

    this.instance.use(errorMiddleware);
  }
}
