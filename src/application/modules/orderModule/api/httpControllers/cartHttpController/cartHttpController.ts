import {
  AddLineItemBody,
  AddLineItemPathParameters,
  AddLineItemResponseOkBody,
  addLineItemBodySchema,
  addLineItemPathParametersSchema,
  addLineItemResponseOkBodySchema,
} from './schemas/addLineItemSchema';
import {
  createCartResponseCreatedBodySchema,
  CreateCartBody,
  CreateCartResponseCreatedBody,
  createCartBodySchema,
} from './schemas/createCartSchema';
import {
  DeleteCartPathParameters,
  DeleteCartResponseNoContentBody,
  deleteCartPathParametersSchema,
  deleteCartResponseNoContentBodySchema,
} from './schemas/deleteCartSchema';
import {
  FindCartPathParameters,
  FindCartResponseOkBody,
  findCartPathParametersSchema,
  findCartResponseOkBodySchema,
} from './schemas/findCartSchema';
import {
  FindCartsQueryParameters,
  FindCartsResponseOkBody,
  findCartsQueryParametersSchema,
  findCartsResponseOkBodySchema,
} from './schemas/findCartsSchema';
import {
  RemoveLineItemBody,
  RemoveLineItemPathParameters,
  RemoveLineItemResponseOkBody,
  removeLineItemBodySchema,
  removeLineItemPathParametersSchema,
  removeLineItemResponseOkBodySchema,
} from './schemas/removeLineItemSchema';
import {
  UpdateCartBody,
  UpdateCartPathParameters,
  UpdateCartResponseOkBody,
  updateCartBodySchema,
  updateCartPathParametersSchema,
  updateCartResponseOkBodySchema,
} from './schemas/updateCartSchema';
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
import { AddLineItemCommandHandler } from '../../../application/commandHandlers/addLineItemCommandHandler/addLineItemCommandHandler';
import { CreateCartCommandHandler } from '../../../application/commandHandlers/createCartCommandHandler/createCartCommandHandler';
import { DeleteCartCommandHandler } from '../../../application/commandHandlers/deleteCartCommandHandler/deleteCartCommandHandler';
import { RemoveLineItemCommandHandler } from '../../../application/commandHandlers/removeLineItemCommandHandler/removeLineItemCommandHandler';
import { UpdateCartCommandHandler } from '../../../application/commandHandlers/updateCartCommandHandler/updateCartCommandHandler';
import { FindCartQueryHandler } from '../../../application/queryHandlers/findCartQueryHandler/findCartQueryHandler';
import { FindCartsQueryHandler } from '../../../application/queryHandlers/findCartsQueryHandler/findCartsQueryHandler';
import { CartNotFoundError } from '../../../application/errors/cartNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromCartError } from '../../../application/errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../../../application/errors/userIsNotCustomerError';
import { symbols } from '../../../symbols';

export class CartHttpController implements HttpController {
  public readonly basePath = 'carts';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerSymbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
    @Inject(symbols.createCartCommandHandler)
    private readonly createCartCommandHandler: CreateCartCommandHandler,
    @Inject(symbols.deleteCartCommandHandler)
    private readonly deleteCartCommandHandler: DeleteCartCommandHandler,
    @Inject(symbols.updateCartCommandHandler)
    private readonly updateCartCommandHandler: UpdateCartCommandHandler,
    @Inject(symbols.findCartQueryHandler)
    private readonly findCartQueryHandler: FindCartQueryHandler,
    @Inject(symbols.findCartsQueryHandler)
    private readonly findCartsQueryHandler: FindCartsQueryHandler,
    @Inject(symbols.addLineItemCommandHandler)
    private readonly addLineItemCommandHandler: AddLineItemCommandHandler,
    @Inject(symbols.removeLineItemCommandHandler)
    private readonly removeLineItemCommandHandler: RemoveLineItemCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createCart.bind(this),
        schema: {
          request: {
            body: createCartBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createCartResponseCreatedBodySchema,
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
        handler: this.findCustomerCarts.bind(this),
        schema: {
          request: {
            queryParams: findCartsQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findCartsResponseOkBodySchema,
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
        handler: this.findCart.bind(this),
        schema: {
          request: {
            pathParams: findCartPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findCartResponseOkBodySchema,
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
        handler: this.updateCart.bind(this),
        schema: {
          request: {
            pathParams: updateCartPathParametersSchema,
            body: updateCartBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateCartResponseOkBodySchema,
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
        method: HttpMethodName.post,
        path: ':id/add-line-item',
        handler: this.addLineItem.bind(this),
        schema: {
          request: {
            pathParams: addLineItemPathParametersSchema,
            body: addLineItemBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: addLineItemResponseOkBodySchema,
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
        method: HttpMethodName.post,
        path: ':id/remove-line-item',
        handler: this.removeLineItem.bind(this),
        schema: {
          request: {
            pathParams: removeLineItemPathParametersSchema,
            body: removeLineItemBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: removeLineItemResponseOkBodySchema,
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
        handler: this.deleteCart.bind(this),
        schema: {
          request: {
            pathParams: deleteCartPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteCartResponseNoContentBodySchema,
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

  private async createCart(
    request: HttpRequest<CreateCartBody>,
  ): Promise<HttpCreatedResponse<CreateCartResponseCreatedBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { customerId } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { cart } = await unitOfWork.runInTransaction(async () => {
        const { userId } = request.context;

        try {
          await this.findCustomerQueryHandler.execute({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.createCartCommandHandler.execute({ unitOfWork, draft: { customerId } });
      });

      return { statusCode: HttpStatusCode.created, body: { cart } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }

  private async findCart(
    request: HttpRequest<undefined, undefined, FindCartPathParameters>,
  ): Promise<
    | HttpOkResponse<FindCartResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const cart = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { cart: customerCart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId: id });

        if (customerCart.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
            customerId: customer.id,
            targetCustomerId: customerCart.customerId,
          });
        }

        return customerCart;
      });

      return { statusCode: HttpStatusCode.ok, body: { cart } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof CartNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async findCustomerCarts(
    request: HttpRequest<undefined, FindCartsQueryParameters>,
  ): Promise<HttpOkResponse<FindCartsResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { carts } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        return this.findCartsQueryHandler.execute({ unitOfWork, pagination, customerId: customer.id });
      });

      return { statusCode: HttpStatusCode.ok, body: { data: carts } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }

  private async updateCart(
    request: HttpRequest<UpdateCartBody, undefined, UpdateCartPathParameters>,
  ): Promise<
    | HttpOkResponse<UpdateCartResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const { billingAddressId, deliveryMethod, shippingAddressId } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { cart } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { cart: existingCart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId: id });

        if (existingCart.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
            customerId: customer.id,
            targetCustomerId: existingCart.customerId,
          });
        }

        return this.updateCartCommandHandler.execute({
          unitOfWork,
          cartId: id,
          draft: { billingAddressId, deliveryMethod, shippingAddressId },
        });
      });

      return { statusCode: HttpStatusCode.ok, body: { cart } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof CartNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async addLineItem(
    request: HttpRequest<AddLineItemBody, undefined, AddLineItemPathParameters>,
  ): Promise<
    | HttpOkResponse<AddLineItemResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const { bookId, quantity } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { cart } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { cart: existingCart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId: id });

        if (existingCart.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
            customerId: customer.id,
            targetCustomerId: existingCart.customerId,
          });
        }

        return this.addLineItemCommandHandler.execute({
          unitOfWork,
          cartId: id,
          draft: { bookId, quantity },
        });
      });

      return { statusCode: HttpStatusCode.ok, body: { cart } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof CartNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async removeLineItem(
    request: HttpRequest<RemoveLineItemBody, undefined, RemoveLineItemPathParameters>,
  ): Promise<
    | HttpOkResponse<RemoveLineItemResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const { lineItemId, quantity } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { cart } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { cart: existingCart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId: id });

        if (existingCart.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
            customerId: customer.id,
            targetCustomerId: existingCart.customerId,
          });
        }

        return this.removeLineItemCommandHandler.execute({
          unitOfWork,
          cartId: id,
          draft: { lineItemId, quantity },
        });
      });

      return { statusCode: HttpStatusCode.ok, body: { cart } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof CartNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteCart(
    request: HttpRequest<undefined, undefined, DeleteCartPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteCartResponseNoContentBody>
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

        const { cart: existingCart } = await this.findCartQueryHandler.execute({ unitOfWork, cartId: id });

        if (existingCart.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
            customerId: customer.id,
            targetCustomerId: existingCart.customerId,
          });
        }

        await this.deleteCartCommandHandler.execute({ unitOfWork, cartId: id });
      });
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromCartError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof CartNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
