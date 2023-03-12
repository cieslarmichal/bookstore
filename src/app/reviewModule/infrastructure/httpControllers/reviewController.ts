import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { CreateReviewPayload, createReviewPayloadSchema } from './payloads/createReviewPayload';
import { DeleteReviewPayload, deleteReviewPayloadSchema } from './payloads/deleteReviewPayload';
import { FindReviewPayload, findReviewPayloadSchema } from './payloads/findReviewPayload';
import { FindReviewsPayload, findReviewsPayloadSchema } from './payloads/findReviewsPayload';
import { UpdateReviewPayload, updateReviewPayloadSchema } from './payloads/updateReviewPayload';
import { reviewErrorMiddleware } from './reviewErrorMiddleware';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { AccessTokenData } from '../../../../common/types/accessTokenData';
import { ControllerResponse } from '../../../../common/types/contracts/controllerResponse';
import { LocalsName } from '../../../../common/types/contracts/localsName';
import { QueryParameterName } from '../../../../common/types/contracts/queryParameterName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { customerModuleSymbols } from '../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../customerModule/domain/entities/customer/customer';
import { AuthMiddleware } from '../../../integrations/common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../integrations/common/middlewares/sendResponseMiddleware';
import { CustomerService } from '../../../tests/services/customerService';
import { CreateReviewDraft } from '../../application/services/reviewService/payloads/createReviewDraft';
import { UpdateReviewDraft } from '../../application/services/reviewService/payloads/updateReviewDraft';
import { ReviewService } from '../../application/services/reviewService/reviewService';
import { Review } from '../../domain/entities/review/review';
import { reviewModuleSymbols } from '../../reviewModuleSymbols';
import { CustomerFromAccessTokenNotMatchingCustomerFromReviewError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class ReviewController {
  public readonly router = Router();
  private readonly reviewsEndpoint = '/reviews';
  private readonly reviewEndpoint = `${this.reviewsEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(reviewModuleSymbols.reviewService)
    private readonly reviewService: ReviewService,
    @Inject(customerModuleSymbols.customerService)
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
    const { isbn, rate, comment, accessTokenData } = Validator.validate(createReviewPayloadSchema, input);

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
    const { id } = Validator.validate(findReviewPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const review = await unitOfWork.runInTransaction(async () => {
      return this.reviewService.findReview({ unitOfWork, reviewId: id });
    });

    return review;
  }

  private async findReviews(input: FindReviewsPayload): Promise<Review[]> {
    const { pagination, customerId } = Validator.validate(findReviewsPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const reviews = await unitOfWork.runInTransaction(async () => {
      return this.reviewService.findReviews({ unitOfWork, customerId, pagination });
    });

    return reviews;
  }

  private async updateReview(input: UpdateReviewPayload): Promise<Review> {
    const { id, comment, rate, accessTokenData } = Validator.validate(updateReviewPayloadSchema, input);

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
    const { id, accessTokenData } = Validator.validate(deleteReviewPayloadSchema, input);

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
