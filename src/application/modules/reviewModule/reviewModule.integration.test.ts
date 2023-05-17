import 'reflect-metadata';

import { ReviewHttpController } from './api/httpControllers/reviewHttpController/reviewHttpController';
import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewService } from './application/services/reviewService/reviewService';
import { ReviewServiceImpl } from './application/services/reviewService/reviewServiceImpl';
import { ReviewMapper } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapper';
import { ReviewMapperImpl } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapperImpl';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { ReviewModule } from './reviewModule';
import { reviewModuleSymbols } from './reviewModuleSymbols';
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
    expect(container.get<ReviewMapper>(reviewModuleSymbols.reviewMapper)).toBeInstanceOf(ReviewMapperImpl);

    expect(container.get<ReviewRepositoryFactory>(reviewModuleSymbols.reviewRepositoryFactory)).toBeInstanceOf(
      ReviewRepositoryFactoryImpl,
    );

    expect(container.get<ReviewService>(reviewModuleSymbols.reviewService)).toBeInstanceOf(ReviewServiceImpl);

    expect(container.get<ReviewHttpController>(reviewModuleSymbols.reviewHttpController)).toBeInstanceOf(
      ReviewHttpController,
    );
  });
});
