import express, { json, urlencoded } from 'express';
import { DataSource } from 'typeorm';

import { AddressModule } from './addressModule/addressModule';
import { AddressController } from './addressModule/infrastructure/httpControllers/addressController';
import { AddressEntity } from './addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { ApplicationConfig } from './applicationConfig';
import { AuthorBookModule } from './authorBookModule/authorBookModule';
import { AuthorBookController } from './authorBookModule/infrastructure/httpControllers/authorBookController';
import { AuthorBookEntity } from './authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from './authorModule/authorModule';
import { AuthorController } from './authorModule/infrastructure/httpControllers/authorController';
import { AuthorEntity } from './authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryModule } from './bookCategoryModule/bookCategoryModule';
import { BookCategoryController } from './bookCategoryModule/infrastructure/httpControllers/bookCategoryController';
import { BookCategoryEntity } from './bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookModule } from './bookModule/bookModule';
import { BookController } from './bookModule/infrastructure/httpControllers/bookController';
import { BookEntity } from './bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CategoryModule } from './categoryModule/categoryModule';
import { CategoryController } from './categoryModule/infrastructure/httpControllers/categoryController';
import { CategoryEntity } from './categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from './customerModule/customerModule';
import { CustomerController } from './customerModule/infrastructure/httpControllers/customerController';
import { CustomerEntity } from './customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryController } from './inventoryModule/infrastructure/httpControllers/inventoryController';
import { InventoryEntity } from './inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from './inventoryModule/inventoryModule';
import { CartController } from './orderModule/infrastructure/httpControllers/cartController/cartController';
import { OrderController } from './orderModule/infrastructure/httpControllers/orderController/orderController';
import { CartEntity } from './orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from './orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from './orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from './orderModule/orderModule';
import { ReviewController } from './reviewModule/infrastructure/httpControllers/reviewController';
import { ReviewEntity } from './reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from './reviewModule/reviewModule';
import { UserController } from './userModule/infrastructure/httpControllers/userController';
import { UserEntity } from './userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserModule } from './userModule/userModule';
import { WhishlistController } from './whishlistModule/infrastructure/httpControllers/whishlistController';
import { WhishlistEntryEntity } from './whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from './whishlistModule/whishlistModule';
import { errorMiddleware } from '../common/middlewares/errorMiddleware';
import { jsonMiddleware } from '../common/middlewares/jsonMiddleware';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../libs/logger/loggerModule';
import { PostgresModule } from '../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../libs/postgres/postgresModuleSymbols';
import { UnitOfWorkModule } from '../libs/unitOfWork/unitOfWorkModule';

export class Application {
  public instance: express.Application;

  public constructor(private readonly config: ApplicationConfig) {
    this.instance = express();
  }

  public async initialize(): Promise<void> {
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
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
      WhishlistEntryEntity,
    ];

    const container = await DependencyInjectionContainerFactory.create({
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

    const dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    const bookController = container.get<BookController>(integrationsSymbols.bookController);
    const authorController = container.get<AuthorController>(integrationsSymbols.authorController);
    const userController = container.get<UserController>(integrationsSymbols.userController);
    const categoryController = container.get<CategoryController>(integrationsSymbols.categoryController);
    const authorBookController = container.get<AuthorBookController>(integrationsSymbols.authorBookController);
    const bookCategoryController = container.get<BookCategoryController>(integrationsSymbols.bookCategoryController);
    const addressController = container.get<AddressController>(integrationsSymbols.addressController);
    const customerController = container.get<CustomerController>(integrationsSymbols.customerController);
    const cartController = container.get<CartController>(integrationsSymbols.cartController);
    const orderController = container.get<OrderController>(integrationsSymbols.orderController);
    const inventoryController = container.get<InventoryController>(integrationsSymbols.inventoryController);
    const reviewController = container.get<ReviewController>(integrationsSymbols.reviewController);
    const whishlistController = container.get<WhishlistController>(integrationsSymbols.whishlistController);

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
    this.instance.use('/', cartController.router);
    this.instance.use('/', orderController.router);
    this.instance.use('/', inventoryController.router);
    this.instance.use('/', reviewController.router);
    this.instance.use('/', whishlistController.router);

    this.instance.use(errorMiddleware);
  }
}
