import 'reflect-metadata';

import { ReviewHttpController } from './api/httpControllers/reviewHttpController/reviewHttpController';
import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { ReviewModule } from './reviewModule';
import { reviewSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('ReviewModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new ReviewModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<ReviewRepositoryFactory>(reviewSymbols.reviewRepositoryFactory)).toBeInstanceOf(
      ReviewRepositoryFactoryImpl,
    );

    expect(container.get<ReviewHttpController>(reviewSymbols.reviewHttpController)).toBeInstanceOf(
      ReviewHttpController,
    );
  });
});
