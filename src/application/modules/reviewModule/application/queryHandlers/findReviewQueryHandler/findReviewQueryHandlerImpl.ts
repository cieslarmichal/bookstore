import { FindReviewQueryHandler } from './findReviewQueryHandler';
import {
  FindReviewQueryHandlerPayload,
  findReviewQueryHandlerPayloadSchema,
} from './payloads/findReviewQueryHandlerPayload';
import {
  FindReviewQueryHandlerResult,
  findReviewQueryHandlerResultSchema,
} from './payloads/findReviewQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { reviewSymbols } from '../../../symbols';
import { ReviewNotFoundError } from '../../errors/reviewNotFoundError';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class FindReviewQueryHandlerImpl implements FindReviewQueryHandler {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
  ) {}

  public async execute(input: FindReviewQueryHandlerPayload): Promise<FindReviewQueryHandlerResult> {
    const { unitOfWork, reviewId } = Validator.validate(findReviewQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.findReview({ id: reviewId });

    if (!review) {
      throw new ReviewNotFoundError({ id: reviewId });
    }

    return Validator.validate(findReviewQueryHandlerResultSchema, { review });
  }
}
