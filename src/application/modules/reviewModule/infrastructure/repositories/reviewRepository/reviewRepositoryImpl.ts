import { EntityManager, FindManyOptions } from 'typeorm';

import { ReviewEntity } from './reviewEntity/reviewEntity';
import { ReviewMapper } from './reviewMapper/reviewMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { ReviewNotFoundError } from '../../../application/errors/reviewNotFoundError';
import {
  CreateReviewPayload,
  createReviewPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/createReviewPayload';
import {
  DeleteReviewPayload,
  deleteReviewPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/deleteReviewPayload';
import {
  FindReviewPayload,
  findReviewPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/findReviewPayload';
import {
  FindReviewsPayload,
  findReviewsPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/findReviewsPayload';
import {
  UpdateReviewPayload,
  updateReviewPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/updateReviewPayload';
import { ReviewRepository } from '../../../application/repositories/reviewRepository/reviewRepository';
import { Review } from '../../../domain/entities/review/review';

export class ReviewRepositoryImpl implements ReviewRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly reviewMapper: ReviewMapper) {}

  public async createReview(input: CreateReviewPayload): Promise<Review> {
    const { id, isbn, rate, comment, customerId } = Validator.validate(createReviewPayloadSchema, input);

    let reviewEntityInput: ReviewEntity = { id, isbn, rate, customerId };

    if (comment) {
      reviewEntityInput = { ...reviewEntityInput, comment };
    }

    const review = this.entityManager.create(ReviewEntity, { ...reviewEntityInput });

    const savedReview = await this.entityManager.save(review);

    return this.reviewMapper.map(savedReview);
  }

  public async findReview(input: FindReviewPayload): Promise<Review | null> {
    const { id } = Validator.validate(findReviewPayloadSchema, input);

    const reviewEntity = await this.entityManager.findOne(ReviewEntity, { where: { id } });

    if (!reviewEntity) {
      return null;
    }

    return this.reviewMapper.map(reviewEntity);
  }

  public async findReviews(input: FindReviewsPayload): Promise<Review[]> {
    const { pagination, customerId, isbn } = Validator.validate(findReviewsPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    let findInput: FindManyOptions<ReviewEntity> = {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
    };

    if (customerId) {
      findInput = { ...findInput, where: { customerId } };
    }

    if (isbn) {
      findInput = { ...findInput, where: { ...findInput.where, isbn } };
    }

    const reviewsEntities = await this.entityManager.find(ReviewEntity, findInput);

    return reviewsEntities.map((reviewEntity) => this.reviewMapper.map(reviewEntity));
  }

  public async updateReviews(input: UpdateReviewPayload): Promise<Review> {
    const {
      id,
      draft: { comment, rate },
    } = Validator.validate(updateReviewPayloadSchema, input);

    const reviewEntity = await this.findReview({ id });

    if (!reviewEntity) {
      throw new ReviewNotFoundError({ id });
    }

    let updateOneInput = {};

    if (rate) {
      updateOneInput = { ...updateOneInput, rate };
    }

    if (comment) {
      updateOneInput = { ...updateOneInput, comment };
    }

    await this.entityManager.update(ReviewEntity, { id }, { ...updateOneInput });

    const updatedReviewEntity = await this.findReview({ id });

    return updatedReviewEntity as Review;
  }

  public async deleteReview(input: DeleteReviewPayload): Promise<void> {
    const { id } = Validator.validate(deleteReviewPayloadSchema, input);

    const reviewEntity = await this.findReview({ id });

    if (!reviewEntity) {
      throw new ReviewNotFoundError({ id });
    }

    await this.entityManager.delete(ReviewEntity, { id });
  }
}
