import { CreateReviewPayload, createReviewPayloadSchema } from './payloads/createReviewPayload';
import { DeleteReviewPayload, deleteReviewPayloadSchema } from './payloads/deleteReviewPayload';
import { FindReviewPayload, findReviewPayloadSchema } from './payloads/findReviewPayload';
import { FindReviewsPayload, findReviewsPayloadSchema } from './payloads/findReviewsPayload';
import { UpdateReviewPayload, updateReviewPayloadSchema } from './payloads/updateReviewPayload';
import { ReviewService } from './reviewService';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { Review } from '../../../domain/entities/review/review';
import { ReviewNotFoundError } from '../../../infrastructure/errors/reviewNotFoundError';
import { reviewModuleSymbols } from '../../../reviewModuleSymbols';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class ReviewServiceImpl implements ReviewService {
  public constructor(
    @Inject(reviewModuleSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createReview(input: CreateReviewPayload): Promise<Review> {
    const { unitOfWork, draft } = Validator.validate(createReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating review...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Review created.', context: { reviewId: review.id } });

    return review;
  }

  public async findReview(input: FindReviewPayload): Promise<Review> {
    const { unitOfWork, reviewId } = Validator.validate(findReviewPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.findOne({ id: reviewId });

    if (!review) {
      throw new ReviewNotFoundError({ id: reviewId });
    }

    return review;
  }

  public async findReviews(input: FindReviewsPayload): Promise<Review[]> {
    const { unitOfWork, pagination, customerId, isbn } = Validator.validate(findReviewsPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const reviews = await reviewRepository.findMany({ customerId, isbn, pagination });

    return reviews;
  }

  public async updateReview(input: UpdateReviewPayload): Promise<Review> {
    const { unitOfWork, reviewId, draft } = Validator.validate(updateReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating review...', context: { reviewId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.updateOne({ id: reviewId, draft });

    this.loggerService.info({ message: 'Review updated.', context: { reviewId } });

    return review;
  }

  public async deleteReview(input: DeleteReviewPayload): Promise<void> {
    const { unitOfWork, reviewId } = Validator.validate(deleteReviewPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting review...', context: { reviewId } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    await reviewRepository.deleteOne({ id: reviewId });

    this.loggerService.info({ message: 'Review deleted.', context: { reviewId } });
  }
}
