import { ReviewHttpController } from './api/httpControllers/reviewHttpController/reviewHttpController';
import { CreateReviewCommandHandler } from './application/commandHandlers/createReviewCommandHandler/createReviewCommandHandler';
import { CreateReviewCommandHandlerImpl } from './application/commandHandlers/createReviewCommandHandler/createReviewCommandHandlerImpl';
import { DeleteReviewCommandHandler } from './application/commandHandlers/deleteReviewCommandHandler/deleteReviewCommandHandler';
import { DeleteReviewCommandHandlerImpl } from './application/commandHandlers/deleteReviewCommandHandler/deleteReviewCommandHandlerImpl';
import { UpdateReviewCommandHandler } from './application/commandHandlers/updateReviewCommandHandler/updateReviewCommandHandler';
import { UpdateReviewCommandHandlerImpl } from './application/commandHandlers/updateReviewCommandHandler/updateReviewCommandHandlerImpl';
import { FindReviewQueryHandler } from './application/queryHandlers/findReviewQueryHandler/findReviewQueryHandler';
import { FindReviewQueryHandlerImpl } from './application/queryHandlers/findReviewQueryHandler/findReviewQueryHandlerImpl';
import { FindReviewsQueryHandler } from './application/queryHandlers/findReviewsQueryHandler/findReviewsQueryHandler';
import { FindReviewsQueryHandlerImpl } from './application/queryHandlers/findReviewsQueryHandler/findReviewsQueryHandlerImpl';
import { ReviewRepositoryFactory } from './application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewMapper } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapper';
import { ReviewMapperImpl } from './infrastructure/repositories/reviewRepository/reviewMapper/reviewMapperImpl';
import { ReviewRepositoryFactoryImpl } from './infrastructure/repositories/reviewRepository/reviewRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class ReviewModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<ReviewMapper>(symbols.reviewMapper, ReviewMapperImpl);

    container.bindToConstructor<ReviewRepositoryFactory>(symbols.reviewRepositoryFactory, ReviewRepositoryFactoryImpl);

    container.bindToConstructor<CreateReviewCommandHandler>(
      symbols.createReviewCommandHandler,
      CreateReviewCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateReviewCommandHandler>(
      symbols.updateReviewCommandHandler,
      UpdateReviewCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteReviewCommandHandler>(
      symbols.deleteReviewCommandHandler,
      DeleteReviewCommandHandlerImpl,
    );

    container.bindToConstructor<FindReviewQueryHandler>(symbols.findReviewQueryHandler, FindReviewQueryHandlerImpl);

    container.bindToConstructor<FindReviewsQueryHandler>(symbols.findReviewsQueryHandler, FindReviewsQueryHandlerImpl);

    container.bindToConstructor<ReviewHttpController>(symbols.reviewHttpController, ReviewHttpController);
  }
}
