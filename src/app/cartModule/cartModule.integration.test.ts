import 'reflect-metadata';

import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { CartService } from './application/services/cartService/cartService';
import { CartServiceImpl } from './application/services/cartService/cartServiceImpl';
import { CartModule } from './cartModule';
import { cartModuleSymbols } from './cartModuleSymbols';
import { CartController } from './infrastructure/httpControllers/cartController';
import { CartMapper } from './infrastructure/repositories/cartRepository/cartMapper/cartMapper';
import { CartMapperImpl } from './infrastructure/repositories/cartRepository/cartMapper/cartMapperImpl';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AddressModule } from '../addressModule/addressModule';
import { BookModule } from '../bookModule/bookModule';
import { InventoryModule } from '../inventoryModule/inventoryModule';
import { LineItemModule } from '../lineItemModule/lineItemModule';

describe('CartModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new CartModule(),
        new LineItemModule(),
        new BookModule(),
        new AddressModule(),
        new InventoryModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<CartMapper>(cartModuleSymbols.cartMapper)).toBeInstanceOf(CartMapperImpl);

    expect(container.get<CartRepositoryFactory>(cartModuleSymbols.cartRepositoryFactory)).toBeInstanceOf(
      CartRepositoryFactoryImpl,
    );

    expect(container.get<CartService>(cartModuleSymbols.cartService)).toBeInstanceOf(CartServiceImpl);

    expect(container.get<CartController>(cartModuleSymbols.cartController)).toBeInstanceOf(CartController);
  });
});
