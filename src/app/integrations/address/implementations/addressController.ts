/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { addressErrorMiddleware } from './addressErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Address } from '../../../domain/address/contracts/address';
import { AddressService } from '../../../domain/address/contracts/services/addressService/addressService';
import { CreateAddressDraft } from '../../../domain/address/contracts/services/addressService/createAddressDraft';
import { Customer } from '../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { UserRole } from '../../../domain/user/contracts/userRole';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { AccessTokenData } from '../../accessTokenData';
import { FilterDataParser } from '../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateAddressPayload, createAddressPayloadSchema } from '../contracts/createAddressPayload';
import { DeleteAddressPayload, deleteAddressPayloadSchema } from '../contracts/deleteAddressPayload';
import { findAddressesFilters } from '../contracts/findAddressesFilters';
import { FindAddressesPayload, findAddressesPayloadSchema } from '../contracts/findAddressesPayload';
import { FindAddressPayload, findAddressPayloadSchema } from '../contracts/findAddressPayload';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

export class AddressController {
  public readonly router = Router();
  private readonly addressesEndpoint = '/addresses';
  private readonly addressEndpoint = `${this.addressesEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
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
        const filters = this.filterDataParser.parse({
          jsonData: request.query[QueryParameterName.filter] as string,
          supportedFieldsFilters: findAddressesFilters,
        });

        const page = Number(request.query[QueryParameterName.page]);

        const limit = Number(request.query[QueryParameterName.limit]);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const addresses = await this.findAddresses({ filters, pagination });

        const controllerResponse: ControllerResponse = { data: { addresses }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteAddress({ id: id as string });

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
    };

    if (deliveryInstructions) {
      createAddressDraft = { ...createAddressDraft, deliveryInstructions };
    }

    if (customerId) {
      createAddressDraft = { ...createAddressDraft, customerId };
    }

    const address = await unitOfWork.runInTransaction(async () => {
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
    const { filters, pagination } = PayloadFactory.create(findAddressesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const addresses = await unitOfWork.runInTransaction(async () => {
      return this.addressService.findAddresses({ unitOfWork, filters, pagination });
    });

    return addresses;
  }

  private async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteAddressPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.addressService.deleteAddress({ unitOfWork, addressId: id as string });
    });
  }
}