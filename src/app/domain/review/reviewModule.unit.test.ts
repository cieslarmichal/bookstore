import 'reflect-metadata';

import { ReviewRepositoryFactory } from './contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { ReviewMapper } from './contracts/mappers/reviewMapper/reviewMapper';
import { ReviewService } from './contracts/services/reviewService/reviewService';
import { ReviewRepositoryFactoryImpl } from './implementations/factories/reviewRepositoryFactory/reviewRepositoryFactoryImpl';
import { ReviewMapperImpl } from './implementations/mappers/reviewMapper/reviewMapperImpl';
import { ReviewServiceImpl } from './implementations/services/reviewService/reviewServiceImpl';
import { ReviewModule } from './reviewModule';
import { reviewSymbols } from './reviewSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('ReviewModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new ReviewModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(3);

    expect(container.get<ReviewMapper>(reviewSymbols.reviewMapper)).toBeInstanceOf(ReviewMapperImpl);

    expect(container.get<ReviewRepositoryFactory>(reviewSymbols.reviewRepositoryFactory)).toBeInstanceOf(
      ReviewRepositoryFactoryImpl,
    );

    expect(container.get<ReviewService>(reviewSymbols.reviewService)).toBeInstanceOf(ReviewServiceImpl);
  });
});
