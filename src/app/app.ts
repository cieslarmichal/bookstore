import { AwilixContainer } from 'awilix';
import express, { json, urlencoded } from 'express';

import { errorMiddleware } from './integrations/common/middlewares/errorMiddleware';
import { jsonMiddleware } from './integrations/common/middlewares/jsonMiddleware';
import { integrationsSymbols } from './integrations/integrationsSymbols';

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

    const bookController = this.container.resolve(integrationsSymbols.bookController);
    const authorController = this.container.resolve(integrationsSymbols.authorController);
    const userController = this.container.resolve(integrationsSymbols.userController);
    const categoryController = this.container.resolve(integrationsSymbols.categoryController);
    const authorBookController = this.container.resolve(integrationsSymbols.authorBookController);
    const bookCategoryController = this.container.resolve(integrationsSymbols.bookCategoryController);
    const addressController = this.container.resolve(integrationsSymbols.addressController);
    const customerController = this.container.resolve(integrationsSymbols.customerController);

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
