import 'reflect-metadata';

import { AddressController } from './address/implementations/addressController';
import { AuthorController } from './author/implementations/authorController';
import { AuthorBookController } from './authorBook/implementations/authorBookController';
import { BookController } from './book/implementations/bookController';
import { BookCategoryController } from './bookCategory/implementations/bookCategoryController';
import { CartController } from './cart/implementations/cartController';
import { CategoryController } from './category/implementations/categoryController';
import { CustomerController } from './customer/implementations/customerController';
import { IntegrationsModule } from './integrationsModule';
import { integrationsSymbols } from './integrationsSymbols';
import { InventoryController } from './inventory/implementations/inventoryController';
import { OrderController } from './order/implementations/orderController';
import { UserController } from './user/implementations/userController';
import { AddressModule } from '../domain/address/addressModule';
import { AuthorModule } from '../domain/author/authorModule';
import { AuthorBookModule } from '../domain/authorBook/authorBookModule';
import { BookModule } from '../domain/book/bookModule';
import { BookCategoryModule } from '../domain/bookCategory/bookCategoryModule';
import { CartModule } from '../domain/cart/cartModule';
import { CategoryModule } from '../domain/category/categoryModule';
import { CustomerModule } from '../domain/customer/customerModule';
import { InventoryModule } from '../domain/inventory/inventoryModule';
import { LineItemModule } from '../domain/lineItem/lineItemModule';
import { OrderModule } from '../domain/order/orderModule';
import { UserModuleConfigTestFactory } from '../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../domain/user/userModule';
import { DependencyInjectionContainer } from '../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../libs/unitOfWork/unitOfWorkModule';

describe('IntegrationsModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
        new AddressModule(),
        new AuthorModule(),
        new AuthorBookModule(),
        new BookModule(),
        new BookCategoryModule(),
        new CategoryModule(),
        new CustomerModule(),
        new UserModule(userModuleConfig),
        new IntegrationsModule(),
        new CartModule(),
        new LineItemModule(),
        new InventoryModule(),
        new OrderModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<BookController>(integrationsSymbols.bookController)).toBeInstanceOf(BookController);

    expect(container.get<AuthorController>(integrationsSymbols.authorController)).toBeInstanceOf(AuthorController);

    expect(container.get<UserController>(integrationsSymbols.userController)).toBeInstanceOf(UserController);

    expect(container.get<CategoryController>(integrationsSymbols.categoryController)).toBeInstanceOf(
      CategoryController,
    );

    expect(container.get<AuthorBookController>(integrationsSymbols.authorBookController)).toBeInstanceOf(
      AuthorBookController,
    );

    expect(container.get<BookCategoryController>(integrationsSymbols.bookCategoryController)).toBeInstanceOf(
      BookCategoryController,
    );

    expect(container.get<AddressController>(integrationsSymbols.addressController)).toBeInstanceOf(AddressController);

    expect(container.get<CustomerController>(integrationsSymbols.customerController)).toBeInstanceOf(
      CustomerController,
    );

    expect(container.get<CartController>(integrationsSymbols.cartController)).toBeInstanceOf(CartController);

    expect(container.get<OrderController>(integrationsSymbols.orderController)).toBeInstanceOf(OrderController);

    expect(container.get<InventoryController>(integrationsSymbols.inventoryController)).toBeInstanceOf(
      InventoryController,
    );
  });
});
