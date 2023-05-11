import { ReviewHttpController } from './api/httpControllers/reviewHttpController/reviewHttpController';
import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewService } from './application/services/reviewService/reviewService';
import { ReviewServiceImpl } from './application/services/reviewService/reviewServiceImpl';
import { ReviewMapper } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapper';
import { ReviewMapperImpl } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapperImpl';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { reviewModuleSymbols } from './reviewModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class ReviewModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<ReviewMapper>(reviewModuleSymbols.reviewMapper, ReviewMapperImpl);

    container.bindToConstructor<ReviewRepositoryFactory>(
      reviewModuleSymbols.reviewRepositoryFactory,
      ReviewRepositoryFactoryImpl,
    );

    container.bindToConstructor<ReviewService>(reviewModuleSymbols.reviewService, ReviewServiceImpl);

    container.bindToConstructor<ReviewHttpController>(reviewModuleSymbols.reviewHttpController, ReviewHttpController);
  }
}
