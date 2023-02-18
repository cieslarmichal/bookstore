import 'reflect-metadata';

import { CartModule } from './cartModule';
import { cartSymbols } from './cartSymbols';
import { CartRepositoryFactory } from './contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartMapper } from './contracts/mappers/cartMapper/cartMapper';
import { CartService } from './contracts/services/cartService/cartService';
import { CartRepositoryFactoryImpl } from './implementations/factories/cartRepositoryFactory/cartRepositoryFactoryImpl';
import { CartMapperImpl } from './implementations/mappers/cartMapper/cartMapperImpl';
import { CartServiceImpl } from './implementations/services/cartService/cartServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { BookModule } from '../book/bookModule';
import { LineItemModule } from '../lineItem/lineItemModule';

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
      ],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(3);

    expect(container.get<CartMapper>(cartSymbols.cartMapper)).toBeInstanceOf(CartMapperImpl);

    expect(container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory)).toBeInstanceOf(
      CartRepositoryFactoryImpl,
    );

    expect(container.get<CartService>(cartSymbols.cartService)).toBeInstanceOf(CartServiceImpl);
  });
});
