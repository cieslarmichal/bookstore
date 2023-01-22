import { AwilixContainer } from 'awilix';
import express, { json, urlencoded } from 'express';

import { errorMiddleware } from './app/integrations/common/middlewares/errorMiddleware';
import { jsonMiddleware } from './app/integrations/common/middlewares/jsonMiddleware';
import {
  ADDRESS_CONTROLLER,
  AUTHOR_BOOK_CONTROLLER,
  AUTHOR_CONTROLLER,
  BOOK_CATEGORY_CONTROLLER,
  BOOK_CONTROLLER,
  CATEGORY_CONTROLLER,
  CUSTOMER_CONTROLLER,
  USER_CONTROLLER,
} from './app/integrations/integrationsSymbols';

export class App {
  public instance: express.Application;

  public constructor(private readonly container: AwilixContainer) {
    this.instance = express();
    this.setup();
  }

  private async setup(): Promise<void> {
    this.instance.use(json());
    this.instance.use(urlencoded({ extended: false }));
    this.instance.use(jsonMiddleware);

    const bookController = this.container.resolve(BOOK_CONTROLLER);
    const authorController = this.container.resolve(AUTHOR_CONTROLLER);
    const userController = this.container.resolve(USER_CONTROLLER);
    const categoryController = this.container.resolve(CATEGORY_CONTROLLER);
    const authorBookController = this.container.resolve(AUTHOR_BOOK_CONTROLLER);
    const bookCategoryController = this.container.resolve(BOOK_CATEGORY_CONTROLLER);
    const addressController = this.container.resolve(ADDRESS_CONTROLLER);
    const customerController = this.container.resolve(CUSTOMER_CONTROLLER);

    this.instance.use('/', bookController.router);
    this.instance.use('/', authorController.router);
    this.instance.use('/', userController.router);
    this.instance.use('/', categoryController.router);
    this.instance.use('/', authorBookController.router);
    this.instance.use('/', bookCategoryController.router);
    this.instance.use('/', addressController.router);
    this.instance.use('/', customerController.router);

    this.instance.use(errorMiddleware);
  }
}
