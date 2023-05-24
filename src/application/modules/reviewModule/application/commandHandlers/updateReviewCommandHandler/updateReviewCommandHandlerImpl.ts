import {
  UpdateReviewCommandHandlerPayload,
  updateReviewCommandHandlerPayloadSchema,
} from './payloads/updateReviewCommandHandlerPayload';
import {
  UpdateReviewCommandHandlerResult,
  updateReviewCommandHandlerResultSchema,
} from './payloads/updateReviewCommandHandlerResult';
import { UpdateReviewCommandHandler } from './updateReviewCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { reviewSymbols } from '../../../symbols';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class UpdateReviewCommandHandlerImpl implements UpdateReviewCommandHandler {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateReviewCommandHandlerPayload): Promise<UpdateReviewCommandHandlerResult> {
    const { unitOfWork, reviewId, draft } = Validator.validate(updateReviewCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating review...', context: { reviewId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.updateReviews({ id: reviewId, draft });

    this.loggerService.info({ message: 'Review updated.', context: { reviewId } });

    return Validator.validate(updateReviewCommandHandlerResultSchema, { review });
  }
}
