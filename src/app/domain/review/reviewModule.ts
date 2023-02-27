import { ReviewRepositoryFactory } from './contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { ReviewMapper } from './contracts/mappers/reviewMapper/reviewMapper';
import { ReviewService } from './contracts/services/reviewService/reviewService';
import { ReviewRepositoryFactoryImpl } from './implementations/factories/reviewRepositoryFactory/reviewRepositoryFactoryImpl';
import { ReviewMapperImpl } from './implementations/mappers/reviewMapper/reviewMapperImpl';
import { ReviewServiceImpl } from './implementations/services/reviewService/reviewServiceImpl';
import { reviewSymbols } from './reviewSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class ReviewModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<ReviewMapper>(reviewSymbols.reviewMapper, ReviewMapperImpl);

    container.bindToConstructor<ReviewRepositoryFactory>(
      reviewSymbols.reviewRepositoryFactory,
      ReviewRepositoryFactoryImpl,
    );

    container.bindToConstructor<ReviewService>(reviewSymbols.reviewService, ReviewServiceImpl);
  }
}
