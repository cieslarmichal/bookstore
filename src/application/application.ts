import 'reflect-metadata';

import { fastify } from 'fastify';
import { DataSource } from 'typeorm';

import { EnvKey } from './envKey';
import { HttpRouter } from './httpRouter/httpRouter';
import { AddressModule } from './modules/addressModule/addressModule';
import { AddressEntity } from './modules/addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookModule } from './modules/authorBookModule/authorBookModule';
import { AuthorBookEntity } from './modules/authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from './modules/authorModule/authorModule';
import { AuthorEntity } from './modules/authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryModule } from './modules/bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from './modules/bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookModule } from './modules/bookModule/bookModule';
import { BookEntity } from './modules/bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CategoryModule } from './modules/categoryModule/categoryModule';
import { CategoryEntity } from './modules/categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from './modules/customerModule/customerModule';
import { CustomerEntity } from './modules/customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from './modules/inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from './modules/inventoryModule/inventoryModule';
import { CartEntity } from './modules/orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from './modules/orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from './modules/orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from './modules/orderModule/orderModule';
import { ReviewEntity } from './modules/reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from './modules/reviewModule/reviewModule';
import { UserEntity } from './modules/userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserModule } from './modules/userModule/userModule';
import { WhishlistEntryEntity } from './modules/whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from './modules/whishlistModule/whishlistModule';
import { DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../libs/logger/loggerModule';
import { loggerModuleSymbols } from '../libs/logger/loggerModuleSymbols';
import { LogLevel } from '../libs/logger/logLevel';
import { LoggerService } from '../libs/logger/services/loggerService/loggerService';
import { PostgresModule } from '../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../libs/postgres/postgresModuleSymbols';
import { UnitOfWorkModule } from '../libs/unitOfWork/unitOfWorkModule';

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
