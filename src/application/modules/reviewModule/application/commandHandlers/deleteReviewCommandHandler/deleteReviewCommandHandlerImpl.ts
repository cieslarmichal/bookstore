import { DeleteReviewCommandHandler } from './deleteReviewCommandHandler';
import {
  DeleteReviewCommandHandlerPayload,
  deleteReviewCommandHandlerPayloadSchema,
} from './payloads/deleteReviewCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { reviewSymbols } from '../../../symbols';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class DeleteReviewCommandHandlerImpl implements DeleteReviewCommandHandler {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteReviewCommandHandlerPayload): Promise<void> {
    const { unitOfWork, reviewId } = Validator.validate(deleteReviewCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting review...', context: { reviewId } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    await reviewRepository.deleteReview({ id: reviewId });

    this.loggerService.info({ message: 'Review deleted.', context: { reviewId } });
  }
}
