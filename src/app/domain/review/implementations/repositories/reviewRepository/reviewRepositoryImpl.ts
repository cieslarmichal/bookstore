import { EntityManager } from 'typeorm';

import { Validator } from '../../../../../libs/validator/implementations/validator';
import { ReviewMapper } from '../../../contracts/mappers/reviewMapper/reviewMapper';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/reviewRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/reviewRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/reviewRepository/findManyPayload';
import { FindOnePayload, findOnePayloadSchema } from '../../../contracts/repositories/reviewRepository/findOnePayload';
import { ReviewRepository } from '../../../contracts/repositories/reviewRepository/reviewRepository';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/reviewRepository/updateOnePayload';
import { Review } from '../../../contracts/review';
import { ReviewEntity } from '../../../contracts/reviewEntity';
import { ReviewNotFoundError } from '../../../errors/reviewNotFoundError';

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
