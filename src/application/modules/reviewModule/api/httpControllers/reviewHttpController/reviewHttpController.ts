import {
  createReviewResponseCreatedBodySchema,
  CreateReviewBody,
  CreateReviewResponseCreatedBody,
  createReviewBodySchema,
} from './schemas/createReviewSchema';
import {
  DeleteReviewPathParameters,
  DeleteReviewResponseNoContentBody,
  deleteReviewPathParametersSchema,
  deleteReviewResponseNoContentBodySchema,
} from './schemas/deleteReviewSchema';
import {
  FindReviewPathParameters,
  FindReviewResponseOkBody,
  findReviewPathParametersSchema,
  findReviewResponseOkBodySchema,
} from './schemas/findReviewSchema';
import {
  FindReviewsQueryParameters,
  FindReviewsResponseOkBody,
  findReviewsQueryParametersSchema,
  findReviewsResponseOkBodySchema,
} from './schemas/findReviewsSchema';
import {
  UpdateReviewBody,
  UpdateReviewPathParameters,
  UpdateReviewResponseOkBody,
  updateReviewBodySchema,
  updateReviewPathParametersSchema,
  updateReviewResponseOkBodySchema,
} from './schemas/updateReviewSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpForbiddenResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { PaginationDataBuilder } from '../../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerService } from '../../../../customerModule/application/services/customerService/customerService';
import { customerSymbols } from '../../../../customerModule/symbols';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { CreateReviewDraft } from '../../../application/services/reviewService/payloads/createReviewDraft';
import { UpdateReviewDraft } from '../../../application/services/reviewService/payloads/updateReviewDraft';
import { ReviewService } from '../../../application/services/reviewService/reviewService';
import { Review } from '../../../domain/entities/review/review';
import { CustomerFromAccessTokenNotMatchingCustomerFromReviewError } from '../../../infrastructure/errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { ReviewNotFoundError } from '../../../infrastructure/errors/reviewNotFoundError';
import { UserIsNotCustomerError } from '../../../infrastructure/errors/userIsNotCustomerError';
import { reviewModuleSymbols } from '../../../reviewModuleSymbols';

export class ReviewHttpController implements HttpController {
  public readonly basePath = 'reviews';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(reviewModuleSymbols.reviewService)
    private readonly reviewService: ReviewService,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createReview.bind(this),
        schema: {
          request: {
            body: createReviewBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createReviewResponseCreatedBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findReviews.bind(this),
        schema: {
          request: {
            queryParams: findReviewsQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findReviewsResponseOkBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findReview.bind(this),
        schema: {
          request: {
            pathParams: findReviewPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findReviewResponseOkBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        handler: this.updateReview.bind(this),
        schema: {
          request: {
            pathParams: updateReviewPathParametersSchema,
            body: updateReviewBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateReviewResponseOkBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteReview.bind(this),
        schema: {
          request: {
            pathParams: deleteReviewPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteReviewResponseNoContentBodySchema,
            },
            [HttpStatusCode.forbidden]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async createReview(
    request: HttpRequest<CreateReviewBody>,
  ): Promise<HttpCreatedResponse<CreateReviewResponseCreatedBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { isbn, rate, comment } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let review: Review | undefined;

    try {
      review = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
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
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { review } };
  }

  private async findReview(
    request: HttpRequest<undefined, undefined, FindReviewPathParameters>,
  ): Promise<
    | HttpOkResponse<FindReviewResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let review: Review | undefined;

    try {
      review = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const customerReview = await this.reviewService.findReview({ unitOfWork, reviewId: id });

        if (customerReview.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromReviewError({
            customerId: customer.id,
            reviewCustomerId: customerReview.customerId,
          });
        }

        return customerReview;
      });
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromReviewError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof ReviewNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { review } };
  }

  private async findReviews(
    request: HttpRequest<undefined, FindReviewsQueryParameters>,
  ): Promise<HttpOkResponse<FindReviewsResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page, customerId, isbn } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    const reviews = await unitOfWork.runInTransaction(async () => {
      return this.reviewService.findReviews({ unitOfWork, pagination, customerId, isbn });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: reviews } };
  }

  private async updateReview(
    request: HttpRequest<UpdateReviewBody, undefined, UpdateReviewPathParameters>,
  ): Promise<
    | HttpOkResponse<UpdateReviewResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const { comment, rate } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let review: Review | undefined;

    try {
      review = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
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
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromReviewError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof ReviewNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { review } };
  }

  private async deleteReview(
    request: HttpRequest<undefined, undefined, DeleteReviewPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteReviewResponseNoContentBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
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
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromReviewError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof ReviewNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
