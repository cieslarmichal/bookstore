import express, { json, urlencoded } from 'express';

import { AppConfig } from './appConfig';
import { AddressModule } from './domain/address/addressModule';
import { AddressEntity } from './domain/address/contracts/addressEntity';
import { AuthorModule } from './domain/author/authorModule';
import { AuthorEntity } from './domain/author/contracts/authorEntity';
import { AuthorBookModule } from './domain/authorBook/authorBookModule';
import { AuthorBookEntity } from './domain/authorBook/contracts/authorBookEntity';
import { BookModule } from './domain/book/bookModule';
import { BookEntity } from './domain/book/contracts/bookEntity';
import { BookCategoryModule } from './domain/bookCategory/bookCategoryModule';
import { BookCategoryEntity } from './domain/bookCategory/contracts/bookCategoryEntity';
import { CategoryModule } from './domain/category/categoryModule';
import { CategoryEntity } from './domain/category/contracts/categoryEntity';
import { CustomerEntity } from './domain/customer/contracts/customerEntity';
import { CustomerModule } from './domain/customer/customerModule';
import { UserEntity } from './domain/user/contracts/userEntity';
import { UserModule } from './domain/user/userModule';
import { errorMiddleware } from './integrations/common/middlewares/errorMiddleware';
import { jsonMiddleware } from './integrations/common/middlewares/jsonMiddleware';
import { IntegrationsModule } from './integrations/integrationsModule';
import { integrationsSymbols } from './integrations/integrationsSymbols';
import { DependencyInjectionContainerFactory } from './libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from './libs/logger/loggerModule';
import { PostgresModule } from './libs/postgres/postgresModule';

export class App {
  public instance: express.Application;

  public constructor(private readonly config: AppConfig) {
    this.instance = express();

    this.setup();
  }

  private async setup(): Promise<void> {
    const {
      databaseHost,
      databasePort,
      databaseName,
      databaseUser,
      databasePassword,
      jwtSecret,
      jwtExpiresIn,
      hashSaltRounds,
      logLevel,
    } = this.config;

    const entities = [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
    ];

    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule({ databaseHost, databasePort, databaseName, databaseUser, databasePassword, entities }),
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new UserModule({ jwtSecret, jwtExpiresIn, hashSaltRounds }),
        new IntegrationsModule(),
        new AuthorBookModule(),
        new LoggerModule({ logLevel }),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
      ],
    });

    const bookController = container.resolve(integrationsSymbols.bookController);
    const authorController = container.resolve(integrationsSymbols.authorController);
    const userController = container.resolve(integrationsSymbols.userController);
    const categoryController = container.resolve(integrationsSymbols.categoryController);
    const authorBookController = container.resolve(integrationsSymbols.authorBookController);
    const bookCategoryController = container.resolve(integrationsSymbols.bookCategoryController);
    const addressController = container.resolve(integrationsSymbols.addressController);
    const customerController = container.resolve(integrationsSymbols.customerController);

    this.instance.use(json());
    this.instance.use(urlencoded({ extended: false }));
    this.instance.use(jsonMiddleware);

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
