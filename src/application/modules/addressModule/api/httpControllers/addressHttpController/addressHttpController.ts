import {
  createAddressResponseCreatedBodySchema,
  CreateAddressBody,
  CreateAddressResponseCreatedBody,
  createAddressBodySchema,
} from './schemas/createAddressSchema';
import {
  DeleteAddressPathParameters,
  DeleteAddressResponseNoContentBody,
  deleteAddressPathParametersSchema,
  deleteAddressResponseNoContentBodySchema,
} from './schemas/deleteAddressSchema';
import { findAddressesFilters } from './schemas/findAddressesFilters';
import {
  FindAddressesQueryParameters,
  FindAddressesResponseOkBody,
  findAddressesQueryParametersSchema,
  findAddressesResponseOkBodySchema,
} from './schemas/findAddressesSchema';
import {
  FindAddressPathParameters,
  FindAddressResponseOkBody,
  findAddressPathParametersSchema,
  findAddressResponseOkBodySchema,
} from './schemas/findAddressSchema';
import {
  UpdateAddressBody,
  UpdateAddressPathParameters,
  UpdateAddressResponseOkBody,
  updateAddressBodySchema,
  updateAddressPathParametersSchema,
  updateAddressResponseOkBodySchema,
} from './schemas/updateAddressSchema';
import { FilterDataParser } from '../../../../../../common/filterDataParser/filterDataParser';
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
import { Filter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { FindCustomerQueryHandler } from '../../../../customerModule/application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CreateAddressCommandHandler } from '../../../application/commandHandlers/createAddressCommandHandler/createAddressCommandHandler';
import { CreateAddressDraft } from '../../../application/commandHandlers/createAddressCommandHandler/payloads/createAddressDraft';
import { DeleteAddressCommandHandler } from '../../../application/commandHandlers/deleteAddressCommandHandler/deleteAddressCommandHandler';
import { UpdateAddressCommandHandler } from '../../../application/commandHandlers/updateAddressCommandHandler/updateAddressCommandHandler';
import { AddressNotFoundError } from '../../../application/errors/addressNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../../../application/errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { CustomerIdNotProvidedError } from '../../../application/errors/customerIdNotProvidedError';
import { UserIsNotCustomerError } from '../../../application/errors/userIsNotCustomerError';
import { FindAddressesQueryHandler } from '../../../application/queryHandlers/findAddressesQueryHandler/findAddressesQueryHandler';
import { FindAddressQueryHandler } from '../../../application/queryHandlers/findAddressQueryHandler/findAddressQueryHandler';
import { symbols } from '../../../symbols';

@Injectable()
export class AddressHttpController implements HttpController {
  public readonly basePath = 'addresses';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerSymbols.findCustomerQueryHandler)
    private readonly findCustomerQueryHandler: FindCustomerQueryHandler,
    @Inject(symbols.createAddressCommandHandler)
    private readonly createAddressCommandHandler: CreateAddressCommandHandler,
    @Inject(symbols.updateAddressCommandHandler)
    private readonly updateAddressCommandHandler: UpdateAddressCommandHandler,
    @Inject(symbols.deleteAddressCommandHandler)
    private readonly deleteAddressCommandHandler: DeleteAddressCommandHandler,
    @Inject(symbols.findAddressQueryHandler)
    private readonly findAddressQueryHandler: FindAddressQueryHandler,
    @Inject(symbols.findAddressesQueryHandler)
    private readonly findAddressesQueryHandler: FindAddressesQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createAddress.bind(this),
        schema: {
          request: {
            body: createAddressBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createAddressResponseCreatedBodySchema,
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
        handler: this.findAddresses.bind(this),
        schema: {
          request: {
            queryParams: findAddressesQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAddressesResponseOkBodySchema,
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
        handler: this.findAddress.bind(this),
        schema: {
          request: {
            pathParams: findAddressPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAddressResponseOkBodySchema,
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
        handler: this.updateAddress.bind(this),
        schema: {
          request: {
            pathParams: updateAddressPathParametersSchema,
            body: updateAddressBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateAddressResponseOkBodySchema,
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
        handler: this.deleteAddress.bind(this),
        schema: {
          request: {
            pathParams: deleteAddressPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteAddressResponseNoContentBodySchema,
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

  private async createAddress(
    request: HttpRequest<CreateAddressBody>,
  ): Promise<HttpCreatedResponse<CreateAddressResponseCreatedBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const {
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      customerId,
      deliveryInstructions,
    } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let createAddressDraft: CreateAddressDraft = {
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      customerId,
    };

    if (deliveryInstructions) {
      createAddressDraft = { ...createAddressDraft, deliveryInstructions };
    }

    const { address } = await unitOfWork.runInTransaction(async () => {
      const { userId } = request.context;

      try {
        await this.findCustomerQueryHandler.execute({ unitOfWork, userId: userId as string });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId: userId as string });
      }

      return this.createAddressCommandHandler.execute({
        unitOfWork,
        draft: createAddressDraft,
      });
    });

    return { statusCode: HttpStatusCode.created, body: { address } };
  }

  private async findAddress(
    request: HttpRequest<undefined, undefined, FindAddressPathParameters>,
  ): Promise<
    | HttpOkResponse<FindAddressResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const address = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { address: customerAddress } = await this.findAddressQueryHandler.execute({
          unitOfWork,
          addressId: id,
        });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId,
          });
        }

        return customerAddress;
      });

      return { statusCode: HttpStatusCode.ok, body: { address } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromAddressError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof AddressNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async findAddresses(
    request: HttpRequest<undefined, FindAddressesQueryParameters>,
  ): Promise<HttpOkResponse<FindAddressesResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { filter, limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: Number(page) ?? 0, limit: Number(limit) ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findAddressesFilters,
        })
      : [];

    if (!filters.length) {
      throw new CustomerIdNotProvidedError();
    }

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { addresses } = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        filters.map((filter: Filter) => {
          if (
            filter.filterName === FilterName.equal &&
            (filter.values.length !== 1 || filter.values[0] !== customer.id)
          ) {
            throw new CustomerIdNotProvidedError();
          }
        });

        return this.findAddressesQueryHandler.execute({ unitOfWork, filters, pagination });
      });

      return { statusCode: HttpStatusCode.ok, body: { data: addresses } };
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }
  }

  private async updateAddress(
    request: HttpRequest<UpdateAddressBody, undefined, UpdateAddressPathParameters>,
  ): Promise<
    | HttpOkResponse<UpdateAddressResponseOkBody>
    | HttpForbiddenResponse<ResponseErrorBody>
    | HttpNotFoundResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = request.context;

    const { city, country, deliveryInstructions, firstName, lastName, phoneNumber, state, streetAddress, zipCode } =
      request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const address = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          const result = await this.findCustomerQueryHandler.execute({ unitOfWork, userId });

          customer = result.customer;
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const { address: customerAddress } = await this.findAddressQueryHandler.execute({ unitOfWork, addressId: id });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId,
          });
        }

        const { address: updatedAddress } = await this.updateAddressCommandHandler.execute({
          unitOfWork,
          addressId: id,
          draft: {
            city,
            country,
            deliveryInstructions,
            firstName,
            lastName,
            phoneNumber,
            state,
            streetAddress,
            zipCode,
          },
        });

        return updatedAddress;
      });

      return { statusCode: HttpStatusCode.ok, body: { address } };
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromAddressError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof AddressNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteAddress(
    request: HttpRequest<undefined, undefined, DeleteAddressPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteAddressResponseNoContentBody>
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

        const { address: customerAddress } = await this.findAddressQueryHandler.execute({ unitOfWork, addressId: id });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId,
          });
        }

        await this.deleteAddressCommandHandler.execute({ unitOfWork, addressId: id });
      });
    } catch (error) {
      if (
        error instanceof CustomerFromAccessTokenNotMatchingCustomerFromAddressError ||
        error instanceof UserIsNotCustomerError
      ) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      if (error instanceof AddressNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
