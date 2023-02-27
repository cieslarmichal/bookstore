import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { reviewErrorMiddleware } from './reviewErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Customer } from '../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { Review } from '../../../domain/review/contracts/review';
import { CreateReviewDraft } from '../../../domain/review/contracts/services/reviewService/createReviewDraft';
import { ReviewService } from '../../../domain/review/contracts/services/reviewService/reviewService';
import { UpdateReviewDraft } from '../../../domain/review/contracts/services/reviewService/updateReviewDraft';
import { reviewSymbols } from '../../../domain/review/reviewSymbols';
import { Injectable, Inject } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { AccessTokenData } from '../../accessTokenData';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateReviewPayload, createReviewPayloadSchema } from '../contracts/createReviewPayload';
import { DeleteReviewPayload, deleteReviewPayloadSchema } from '../contracts/deleteReviewPayload';
import { FindReviewPayload, findReviewPayloadSchema } from '../contracts/findReviewPayload';
import { FindReviewsPayload, findReviewsPayloadSchema } from '../contracts/findReviewsPayload';
import { UpdateReviewPayload, updateReviewPayloadSchema } from '../contracts/updateReviewPayload';
import { CustomerFromAccessTokenNotMatchingCustomerFromReviewError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class ReviewController {
  public readonly router = Router();
  private readonly reviewsEndpoint = '/reviews';
  private readonly reviewEndpoint = `${this.reviewsEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(reviewSymbols.reviewService)
    private readonly reviewService: ReviewService,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.reviewsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { isbn, rate, comment } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const review = await this.createReview({ isbn, rate, comment, accessTokenData });

        const controllerResponse: ControllerResponse = { data: { review }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.reviewEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const review = await this.findReview({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { review }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.reviewsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const customerId = request.query[QueryParameterName.customerId] as string;

        const reviews = await this.findReviews({ pagination, customerId });

        const controllerResponse: ControllerResponse = { data: { reviews }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.reviewEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { comment, rate } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const review = await this.updateReview({ id: id as string, comment, rate, accessTokenData });

        const controllerResponse: ControllerResponse = { data: { review }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.reviewEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        await this.deleteReview({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(reviewErrorMiddleware);
  }

  private async createReview(input: CreateReviewPayload): Promise<Review> {
    const { isbn, rate, comment, accessTokenData } = PayloadFactory.create(createReviewPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const review = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      let createReviewDraft: CreateReviewDraft = {
        isbn,
        rate,
        customerId: customer.id,
      };

      if (comment) {
        createReviewDraft = { ...createReviewDraft, comment };
      }

      return this.reviewService.createReview({ unitOfWork, draft: createReviewDraft });
    });

    return review;
  }

  private async findReview(input: FindReviewPayload): Promise<Review> {
    const { id } = PayloadFactory.create(findReviewPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const review = await unitOfWork.runInTransaction(async () => {
      return this.reviewService.findReview({ unitOfWork, reviewId: id });
    });

    return review;
  }

  private async findReviews(input: FindReviewsPayload): Promise<Review[]> {
    const { pagination, customerId } = PayloadFactory.create(findReviewsPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const reviews = await unitOfWork.runInTransaction(async () => {
      return this.reviewService.findReviews({ unitOfWork, customerId, pagination });
    });

    return reviews;
  }

  private async updateReview(input: UpdateReviewPayload): Promise<Review> {
    const { id, comment, rate, accessTokenData } = PayloadFactory.create(updateReviewPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const review = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const existingReview = await this.reviewService.findReview({ unitOfWork, reviewId: id });

      if (existingReview.customerId !== customer.id) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromReviewError({
          customerId: customer.id,
          reviewCustomerId: existingReview.customerId,
        });
      }

      let updateReviewDraft: UpdateReviewDraft = {};

      if (comment) {
        updateReviewDraft = { ...updateReviewDraft, comment };
      }

      if (rate) {
        updateReviewDraft = { ...updateReviewDraft, rate };
      }

      return this.reviewService.updateReview({ unitOfWork, reviewId: id, draft: updateReviewDraft });
    });

    return review;
  }

  private async deleteReview(input: DeleteReviewPayload): Promise<void> {
    const { id, accessTokenData } = PayloadFactory.create(deleteReviewPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const existingReview = await this.reviewService.findReview({ unitOfWork, reviewId: id });

      if (existingReview.customerId !== customer.id) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromReviewError({
          customerId: customer.id,
          reviewCustomerId: existingReview.customerId,
        });
      }

      await this.reviewService.deleteReview({ unitOfWork, reviewId: id });
    });
  }
}
