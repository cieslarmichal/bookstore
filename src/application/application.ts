import 'reflect-metadata';

import { fastify } from 'fastify';
import { DataSource } from 'typeorm';

import { EnvKey } from './envKey.js';
import { HttpRouter } from './httpRouter/httpRouter.js';
import { AddressModule } from './modules/addressModule/addressModule.js';
import { AddressEntity } from './modules/addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity.js';
import { AuthorBookModule } from './modules/authorBookModule/authorBookModule.js';
import { AuthorBookEntity } from './modules/authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity.js';
import { AuthorModule } from './modules/authorModule/authorModule.js';
import { AuthorEntity } from './modules/authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity.js';
import { BookCategoryModule } from './modules/bookCategoryModule/bookCategoryModule.js';
import { BookCategoryEntity } from './modules/bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity.js';
import { BookModule } from './modules/bookModule/bookModule.js';
import { BookEntity } from './modules/bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity.js';
import { CategoryModule } from './modules/categoryModule/categoryModule.js';
import { CategoryEntity } from './modules/categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity.js';
import { CustomerModule } from './modules/customerModule/customerModule.js';
import { CustomerEntity } from './modules/customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity.js';
import { InventoryEntity } from './modules/inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity.js';
import { InventoryModule } from './modules/inventoryModule/inventoryModule.js';
import { CartEntity } from './modules/orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity.js';
import { LineItemEntity } from './modules/orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity.js';
import { OrderEntity } from './modules/orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity.js';
import { OrderModule } from './modules/orderModule/orderModule.js';
import { ReviewEntity } from './modules/reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity.js';
import { ReviewModule } from './modules/reviewModule/reviewModule.js';
import { UserEntity } from './modules/userModule/infrastructure/repositories/userRepository/userEntity/userEntity.js';
import { UserModule } from './modules/userModule/userModule.js';
import { WhishlistEntryEntity } from './modules/whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity.js';
import { WhishlistModule } from './modules/whishlistModule/whishlistModule.js';
import { DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { LoggerModule } from '../libs/logger/loggerModule.js';
import { loggerModuleSymbols } from '../libs/logger/loggerModuleSymbols.js';
import { LogLevel } from '../libs/logger/logLevel.js';
import { LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { PostgresModule } from '../libs/postgres/postgresModule.js';
import { postgresModuleSymbols } from '../libs/postgres/postgresModuleSymbols.js';
import { UnitOfWorkModule } from '../libs/unitOfWork/unitOfWorkModule.js';

export class Application {
  public static createContainer(): DependencyInjectionContainer {
    const databaseHost = String(process.env[EnvKey.databaseHost]);
    const databasePort = Number(process.env[EnvKey.databasePort]);
    const databaseName = String(process.env[EnvKey.databaseName]);
    const databaseUser = String(process.env[EnvKey.databaseUser]);
    const databasePassword = String(process.env[EnvKey.databasePassword]);
    const jwtSecret = String(process.env[EnvKey.jwtSecret]);
    const jwtExpiresIn = String(process.env[EnvKey.jwtExpiresIn]);
    const hashSaltRounds = Number(process.env[EnvKey.hashSaltRounds]);
    const logLevel = process.env[EnvKey.logLevel] as LogLevel;

    const entities = [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
      WhishlistEntryEntity,
    ];

    const container = DependencyInjectionContainerFactory.create({
      modules: [
        new LoggerModule({ logLevel }),
        new PostgresModule({ databaseHost, databasePort, databaseName, databaseUser, databasePassword, entities }),
        new UnitOfWorkModule(),
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new UserModule({ jwtSecret, jwtExpiresIn, hashSaltRounds }),
        new AuthorBookModule(),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    return container;
  }

  public static async init(): Promise<void> {
    const container = Application.createContainer();

    const dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    const server = fastify();

    const httpServerHost = String(process.env[EnvKey.httpServerHost]);

    const httpServerPort = Number(process.env[EnvKey.httpServerPort]);

    const httpRouter = new HttpRouter(server, container);

    httpRouter.registerAllRoutes();

    await server.listen({ host: httpServerHost, port: httpServerPort });

    const loggerService = container.get<LoggerService>(loggerModuleSymbols.loggerService);

    loggerService.log({ message: `Server started.`, context: { httpServerHost, httpServerPort } });
  }
}
