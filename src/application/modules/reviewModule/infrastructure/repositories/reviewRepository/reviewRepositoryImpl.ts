import { EntityManager } from 'typeorm';

import { ReviewEntity } from './reviewEntity/reviewEntity';
import { ReviewMapper } from './reviewMapper/reviewMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/reviewRepository/payloads/updateOnePayload';
import { ReviewRepository } from '../../../application/repositories/reviewRepository/reviewRepository';
import { Review } from '../../../domain/entities/review/review';
import { ReviewNotFoundError } from '../../errors/reviewNotFoundError';

export class ReviewRepositoryImpl implements ReviewRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly reviewMapper: ReviewMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Review> {
    const { id, isbn, rate, comment, customerId } = Validator.validate(createOnePayloadSchema, input);

    let reviewEntityInput: ReviewEntity = { id, isbn, rate, customerId };

    if (comment) {
      reviewEntityInput = { ...reviewEntityInput, comment };
    }

    const review = this.entityManager.create(ReviewEntity, { ...reviewEntityInput });

    const savedReview = await this.entityManager.save(review);

    return this.reviewMapper.map(savedReview);
  }

  public async findOne(input: FindOnePayload): Promise<Review | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const reviewEntity = await this.entityManager.findOne(ReviewEntity, { where: { id } });

    if (!reviewEntity) {
      return null;
    }

    return this.reviewMapper.map(reviewEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Review[]> {
    const { pagination, customerId } = Validator.validate(findManyPayloadSchema, input);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    const reviewsEntities = await this.entityManager.find(ReviewEntity, {
      take: pagination.limit,
      skip: numberOfEnitiesToSkip,
      where: { customerId },
    });

    return reviewsEntities.map((reviewEntity) => this.reviewMapper.map(reviewEntity));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Review> {
    const {
      id,
      draft: { comment, rate },
    } = Validator.validate(updateOnePayloadSchema, input);

    const reviewEntity = await this.findOne({ id });

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

    const updatedReviewEntity = await this.findOne({ id });

    return updatedReviewEntity as Review;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const reviewEntity = await this.findOne({ id });

    if (!reviewEntity) {
      throw new ReviewNotFoundError({ id });
    }

    await this.entityManager.delete(ReviewEntity, { id });
  }
}
