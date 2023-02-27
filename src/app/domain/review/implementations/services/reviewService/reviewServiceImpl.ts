import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { ReviewRepositoryFactory } from '../../../contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { Review } from '../../../contracts/review';
import {
  CreateReviewPayload,
  createReviewPayloadSchema,
} from '../../../contracts/services/reviewService/createReviewPayload';
import {
  DeleteReviewPayload,
  deleteReviewPayloadSchema,
} from '../../../contracts/services/reviewService/deleteReviewPayload';
import {
  FindReviewPayload,
  findReviewPayloadSchema,
} from '../../../contracts/services/reviewService/findReviewPayload';
import {
  FindReviewsPayload,
  findReviewsPayloadSchema,
} from '../../../contracts/services/reviewService/findReviewsPayload';
import { ReviewService } from '../../../contracts/services/reviewService/reviewService';
import {
  UpdateReviewPayload,
  updateReviewPayloadSchema,
} from '../../../contracts/services/reviewService/updateReviewPayload';
import { ReviewNotFoundError } from '../../../errors/reviewNotFoundError';
import { reviewSymbols } from '../../../reviewSymbols';

@Injectable()
export class ReviewServiceImpl implements ReviewService {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createReview(input: CreateReviewPayload): Promise<Review> {
    const { unitOfWork, draft } = PayloadFactory.create(createReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating review...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Review created.', context: { reviewId: review.id } });

    return review;
  }

  public async findReview(input: FindReviewPayload): Promise<Review> {
    const { unitOfWork, reviewId } = PayloadFactory.create(findReviewPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.findOne({ id: reviewId });

    if (!review) {
      throw new ReviewNotFoundError({ id: reviewId });
    }

    return review;
  }

  public async findReviews(input: FindReviewsPayload): Promise<Review[]> {
    const { unitOfWork, pagination, customerId } = PayloadFactory.create(findReviewsPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const reviews = await reviewRepository.findMany({ customerId, pagination });

    return reviews;
  }

  public async updateReview(input: UpdateReviewPayload): Promise<Review> {
    const { unitOfWork, reviewId, draft } = PayloadFactory.create(updateReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating review...', context: { reviewId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.updateOne({ id: reviewId, draft });

    this.loggerService.info({ message: 'Review updated.', context: { reviewId } });

    return review;
  }

  public async deleteReview(input: DeleteReviewPayload): Promise<void> {
    const { unitOfWork, reviewId } = PayloadFactory.create(deleteReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting review...', context: { reviewId } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    await reviewRepository.deleteOne({ id: reviewId });

    this.loggerService.info({ message: 'Review deleted.', context: { reviewId } });
  }
}
