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
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerService } from '../../../../customerModule/application/services/customerService/customerService';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { AddressService } from '../../../application/services/addressService/addressService';
import { CreateAddressDraft } from '../../../application/services/addressService/payloads/createAddressDraft';
import { Address } from '../../../domain/entities/address/address';
import { addressModuleSymbols } from '../../../symbols';
import { AddressNotFoundError } from '../../errors/addressNotFoundError';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { CustomerIdNotProvidedError } from '../../errors/customerIdNotProvidedError';
import { UserIsNotCustomerError } from '../../errors/userIsNotCustomerError';

export class AddressHttpController implements HttpController {
  public readonly basePath = 'addresses';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(addressModuleSymbols.addressService)
    private readonly addressService: AddressService,
    @Inject(customerModuleSymbols.customerService)
    private readonly customerService: CustomerService,
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

    const address = await unitOfWork.runInTransaction(async () => {
      const { userId } = request.context;

      try {
        await this.customerService.findCustomer({ unitOfWork, userId: userId as string });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId: userId as string });
      }

      return this.addressService.createAddress({
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

    let address: Address | undefined;

    try {
      address = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id as string });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId as string,
          });
        }

        return customerAddress;
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

    return { statusCode: HttpStatusCode.ok, body: { address: address as Address } };
  }

  private async findAddresses(
    request: HttpRequest<undefined, FindAddressesQueryParameters>,
  ): Promise<HttpOkResponse<FindAddressesResponseOkBody> | HttpForbiddenResponse<ResponseErrorBody>> {
    const { filter, limit, page } = request.queryParams;

    const { userId } = request.context;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

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

    let addresses: Address[] = [];

    try {
      addresses = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
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

        return this.addressService.findAddresses({ unitOfWork, filters, pagination });
      });
    } catch (error) {
      if (error instanceof UserIsNotCustomerError) {
        return { statusCode: HttpStatusCode.forbidden, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { data: addresses } };
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

    let address: Address | undefined;

    try {
      address = await unitOfWork.runInTransaction(async () => {
        let customer: Customer;

        try {
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId,
          });
        }

        const updatedAddress = await this.addressService.updateAddress({
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

    return { statusCode: HttpStatusCode.ok, body: { address: address as Address } };
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
          customer = await this.customerService.findCustomer({ unitOfWork, userId });
        } catch (error) {
          throw new UserIsNotCustomerError({ userId: userId as string });
        }

        const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id });

        if (customerAddress.customerId !== customer.id) {
          throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
            customerId: customer.id,
            targetCustomerId: customerAddress.customerId,
          });
        }

        await this.addressService.deleteAddress({ unitOfWork, addressId: id });
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
