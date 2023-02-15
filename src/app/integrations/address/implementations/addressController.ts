/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { addressErrorMiddleware } from './addressErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { Filter } from '../../../common/types/contracts/filter';
import { FilterName } from '../../../common/types/contracts/filterName';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { addressSymbols } from '../../../domain/address/addressSymbols';
import { Address } from '../../../domain/address/contracts/address';
import { AddressService } from '../../../domain/address/contracts/services/addressService/addressService';
import { CreateAddressDraft } from '../../../domain/address/contracts/services/addressService/createAddressDraft';
import { Customer } from '../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { UserRole } from '../../../domain/user/contracts/userRole';
import { Inject, Injectable } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { AccessTokenData } from '../../accessTokenData';
import { FilterDataParser } from '../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateAddressPayload, createAddressPayloadSchema } from '../contracts/createAddressPayload';
import { DeleteAddressPayload, deleteAddressPayloadSchema } from '../contracts/deleteAddressPayload';
import { findAddressesFilters } from '../contracts/findAddressesFilters';
import { FindAddressesPayload, findAddressesPayloadSchema } from '../contracts/findAddressesPayload';
import { FindAddressPayload, findAddressPayloadSchema } from '../contracts/findAddressPayload';
import { UpdateAddressPayload, updateAddressPayloadSchema } from '../contracts/updateAddressPayload';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { CustomerIdNotProvidedError } from '../errors/customerIdNotProvidedError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class AddressController {
  public readonly router = Router();
  private readonly addressesEndpoint = '/addresses';
  private readonly addressEndpoint = `${this.addressesEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(addressSymbols.addressService)
    private readonly addressService: AddressService,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.addressesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          deliveryInstructions,
          customerId,
        } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const address = await this.createAddress({
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          deliveryInstructions,
          customerId,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { address }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const address = await this.findAddress({ accessTokenData, id: id as string });

        const controllerResponse: ControllerResponse = { data: { address }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.addressesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findAddressesFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const addresses = await this.findAddresses({ filters, pagination, accessTokenData });

        const controllerResponse: ControllerResponse = { data: { addresses }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, deliveryInstructions } =
          request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const address = await this.updateAddress({
          id: id as string,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          deliveryInstructions,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { address }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        await this.deleteAddress({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(addressErrorMiddleware);
  }

  private async createAddress(input: CreateAddressPayload): Promise<Address> {
    const {
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions,
      customerId,
      accessTokenData,
    } = PayloadFactory.create(createAddressPayloadSchema, input);

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
      const { userId } = accessTokenData;

      try {
        await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      return this.addressService.createAddress({
        unitOfWork,
        draft: createAddressDraft,
      });
    });

    return address;
  }

  private async findAddress(input: FindAddressPayload): Promise<Address> {
    const { id, accessTokenData } = PayloadFactory.create(findAddressPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const address = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id as string });

      if (customerAddress.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
          customerId: customer.id,
          targetCustomerId: customerAddress.customerId as string,
        });
      }

      return customerAddress;
    });

    return address;
  }

  private async findAddresses(input: FindAddressesPayload): Promise<Address[]> {
    const { filters, pagination, accessTokenData } = PayloadFactory.create(findAddressesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (!filters.length) {
      throw new CustomerIdNotProvidedError();
    }

    const { userId } = accessTokenData;

    let customer: Customer;

    try {
      customer = await this.customerService.findCustomer({ unitOfWork, userId });
    } catch (error) {
      throw new UserIsNotCustomerError({ userId });
    }

    filters.map((filter: Filter) => {
      if (filter.filterName === FilterName.equal && (filter.values.length !== 1 || filter.values[0] !== customer.id)) {
        throw new CustomerIdNotProvidedError();
      }
    });

    const addresses = await unitOfWork.runInTransaction(async () => {
      return this.addressService.findAddresses({ unitOfWork, filters, pagination });
    });

    return addresses;
  }

  private async updateAddress(input: UpdateAddressPayload): Promise<Address> {
    const {
      id,
      city,
      country,
      deliveryInstructions,
      firstName,
      lastName,
      phoneNumber,
      state,
      streetAddress,
      zipCode,
      accessTokenData,
    } = PayloadFactory.create(updateAddressPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const address = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id });

      if (customerAddress.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
          customerId: customer.id,
          targetCustomerId: customerAddress.customerId,
        });
      }

      const updatedAddress = await this.addressService.updateAddress({
        unitOfWork,
        addressId: id,
        draft: { city, country, deliveryInstructions, firstName, lastName, phoneNumber, state, streetAddress, zipCode },
      });

      return updatedAddress;
    });

    return address;
  }

  private async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { id, accessTokenData } = PayloadFactory.create(deleteAddressPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerAddress = await this.addressService.findAddress({ unitOfWork, addressId: id });

      if (customerAddress.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
          customerId: customer.id,
          targetCustomerId: customerAddress.customerId,
        });
      }

      await this.addressService.deleteAddress({ unitOfWork, addressId: id });
    });
  }
}
