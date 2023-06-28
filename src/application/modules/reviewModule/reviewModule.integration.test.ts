import 'reflect-metadata';

import { ReviewHttpController } from './api/httpControllers/reviewHttpController/reviewHttpController';
import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { reviewSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('ReviewModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
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
