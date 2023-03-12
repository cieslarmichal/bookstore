import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewService } from './application/services/reviewService/reviewService';
import { ReviewServiceImpl } from './application/services/reviewService/reviewServiceImpl';
import { ReviewController } from './infrastructure/httpControllers/reviewController';
import { ReviewMapper } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapper';
import { ReviewMapperImpl } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapperImpl';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { reviewModuleSymbols } from './reviewModuleSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class ReviewModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<ReviewMapper>(reviewModuleSymbols.reviewMapper, ReviewMapperImpl);

    container.bindToConstructor<ReviewRepositoryFactory>(
      reviewModuleSymbols.reviewRepositoryFactory,
      ReviewRepositoryFactoryImpl,
    );

    container.bindToConstructor<ReviewService>(reviewModuleSymbols.reviewService, ReviewServiceImpl);

    container.bindToConstructor<ReviewController>(reviewModuleSymbols.reviewController, ReviewController);
  }
}
