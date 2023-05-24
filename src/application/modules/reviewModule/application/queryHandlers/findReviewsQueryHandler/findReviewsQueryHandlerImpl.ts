import { FindReviewsQueryHandler } from './findReviewsQueryHandler';
import {
  FindReviewsQueryHandlerPayload,
  findReviewsQueryHandlerPayloadSchema,
} from './payloads/findReviewsQueryHandlerPayload';
import {
  FindReviewsQueryHandlerResult,
  findReviewsQueryHandlerResultSchema,
} from './payloads/findReviewsQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { reviewSymbols } from '../../../symbols';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class FindReviewsQueryHandlerImpl implements FindReviewsQueryHandler {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
  ) {}

  public async execute(input: FindReviewsQueryHandlerPayload): Promise<FindReviewsQueryHandlerResult> {
    const { unitOfWork, pagination, customerId, isbn } = Validator.validate(
      findReviewsQueryHandlerPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const reviews = await reviewRepository.findReviews({ customerId, isbn, pagination });

    return Validator.validate(findReviewsQueryHandlerResultSchema, { reviews });
  }
}
