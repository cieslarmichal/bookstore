import express, { json, urlencoded } from 'express';
import { DataSource } from 'typeorm';

import { AddressModule } from './addressModule/addressModule';
import { AddressEntity } from './addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AppConfig } from './appConfig';
import { AuthorBookModule } from './authorBookModule/authorBookModule';
import { AuthorBookEntity } from './authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from './authorModule/authorModule';
import { AuthorEntity } from './authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryModule } from './bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from './bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookModule } from './bookModule/bookModule';
import { BookEntity } from './bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CartModule } from './cartModule/cartModule';
import { CartEntity } from './cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CategoryModule } from './categoryModule/categoryModule';
import { CategoryEntity } from './categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from './customerModule/customerModule';
import { CustomerEntity } from './customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { AddressController } from './integrations/address/implementations/addressController';
import { AuthorController } from './integrations/author/implementations/authorController';
import { AuthorBookController } from './integrations/authorBook/implementations/authorBookController';
import { BookController } from './integrations/book/implementations/bookController';
import { BookCategoryController } from './integrations/bookCategory/implementations/bookCategoryController';
import { CartController } from './integrations/cart/implementations/cartController';
import { CategoryController } from './integrations/category/implementations/categoryController';
import { errorMiddleware } from './integrations/common/middlewares/errorMiddleware';
import { jsonMiddleware } from './integrations/common/middlewares/jsonMiddleware';
import { CustomerController } from './integrations/customer/implementations/customerController';
import { IntegrationsModule } from './integrations/integrationsModule';
import { integrationsSymbols } from './integrations/integrationsSymbols';
import { InventoryController } from './integrations/inventory/implementations/inventoryController';
import { OrderController } from './integrations/order/implementations/orderController';
import { ReviewController } from './integrations/review/implementations/reviewController';
import { UserController } from './integrations/user/implementations/userController';
import { WhishlistController } from './integrations/whishlist/implementations/whishlistController';
import { InventoryEntity } from './inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from './inventoryModule/inventoryModule';
import { LineItemEntity } from './lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { LineItemModule } from './lineItemModule/lineItemModule';
import { OrderEntity } from './orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from './orderModule/orderModule';
import { ReviewEntity } from './reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from './reviewModule/reviewModule';
import { UserEntity } from './userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserModule } from './userModule/userModule';
import { WhishlistEntryEntity } from './whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from './whishlistModule/whishlistModule';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../libs/logger/loggerModule';
import { PostgresModule } from '../libs/postgres/postgresModule';
import { postgresSymbols } from '../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../libs/unitOfWork/unitOfWorkModule';

export class App {
  public instance: express.Application;

  public constructor(private readonly config: AppConfig) {
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
        new IntegrationsModule(),
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new UserModule({ jwtSecret, jwtExpiresIn, hashSaltRounds }),
        new AuthorBookModule(),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
        new CartModule(),
        new LineItemModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    const dataSource = container.get<DataSource>(postgresSymbols.dataSource);

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
