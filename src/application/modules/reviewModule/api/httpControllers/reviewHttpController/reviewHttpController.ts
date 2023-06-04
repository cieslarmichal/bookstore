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
import { FindCustomerQueryHandler } from '../../../../customerModule/application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CreateReviewCommandHandler } from '../../../application/commandHandlers/createReviewCommandHandler/createReviewCommandHandler';
import { CreateReviewDraft } from '../../../application/commandHandlers/createReviewCommandHandler/payloads/createReviewDraft';
import { DeleteReviewCommandHandler } from '../../../application/commandHandlers/deleteReviewCommandHandler/deleteReviewCommandHandler';
import { UpdateReviewCommandHandler } from '../../../application/commandHandlers/updateReviewCommandHandler/updateReviewCommandHandler';
import { CustomerFromAccessTokenNotMatchingCustomerFromReviewError } from '../../../application/errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { ReviewNotFoundError } from '../../../application/errors/reviewNotFoundError';
import { UserIsNotCustomerError } from '../../../application/errors/userIsNotCustomerError';
import { FindReviewQueryHandler } from '../../../application/queryHandlers/findReviewQueryHandler/findReviewQueryHandler';
import { FindReviewsQueryHandler } from '../../../application/queryHandlers/findReviewsQueryHandler/findReviewsQueryHandler';
import { UpdateReviewDraft } from '../../../application/repositories/reviewRepository/payloads/updateReviewDraft';
import { symbols } from '../../../symbols';

export class ReviewHttpController implements HttpController {
  public readonly basePath = 'reviews';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createReviewCommandHandler)
    private readonly createReviewCommandHandler: CreateReviewCommandHandler,
    @Inject(symbols.deleteReviewCommandHandler)
    private readonly deleteReviewCommandHandler: DeleteReviewCommandHandler,
    @Inject(symbols.updateReviewCommandHandler)
    private readonly updateReviewCommandHandler: UpdateReviewCommandHandler,
    @Inject(symbols.findReviewQueryHandler)
    private readonly findReviewQueryHandler: FindReviewQueryHandler,
    @Inject(symbols.findReviewsQueryHandler)
    private readonly findReviewsQueryHandler: FindReviewsQueryHandler,
    @Inject(customerSymbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
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

    try {
      const { review } = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
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

        return this.createReviewCommandHandler.execute({ unitOfWork, draft: createReviewDraft });
      });

      return { statusCode: HttpStatusCode.created, body: { review } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
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

    try {
      const review = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { review: customerReview } = await this.findReviewQueryHandler.execute({ unitOfWork, reviewId: id });

        if (customerReview.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromReviewError({
            customerId: customer.id,
            reviewCustomerId: customerReview.customerId,
          });
        }

        return customerReview;
      });

      return { statusCode: HttpStatusCode.ok, body: { review } };
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
  }

  private async findReviews(
    request: HttpRequest<undefined, FindReviewsQueryParameters>,
  ): Promise<HttpOkResponse<FindReviewsResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page, customerId, isbn } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { reviews } = await unitOfWork.runInTransaction(async () => {
      return this.findReviewsQueryHandler.execute({ unitOfWork, pagination, customerId, isbn });
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

    try {
      const { review } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { review: existingReview } = await this.findReviewQueryHandler.execute({ unitOfWork, reviewId: id });

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

        return this.updateReviewCommandHandler.execute({ unitOfWork, reviewId: id, draft: updateReviewDraft });
      });

      return { statusCode: HttpStatusCode.ok, body: { review } };
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
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { review: existingReview } = await this.findReviewQueryHandler.execute({ unitOfWork, reviewId: id });

        if (existingReview.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromReviewError({
            customerId: customer.id,
            reviewCustomerId: existingReview.customerId,
          });
        }

        await this.deleteReviewCommandHandler.execute({ unitOfWork, reviewId: id });
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
