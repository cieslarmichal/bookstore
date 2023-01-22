/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { AddressService } from '../../../../../domain/address/contracts/services/addressService/addressService';
import { Customer } from '../../../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../../../domain/customer/contracts/services/customerService/customerService';
import { UserRole } from '../../../../../domain/user/contracts/userRole';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { AddressController } from '../../../contracts/controllers/addressController/addressController';
import { findAddressesFilters } from '../../../contracts/controllers/addressController/findAddressesFilters';
import { CustomerFromAccessTokenNotMatchingCustomerFromAddressError } from '../../../errors/customerFromAccessTokenNotMatchingCustomerFromAddressError';
import { UserIsNotCustomerError } from '../../../errors/userIsNotCustomerError';
import { addressErrorMiddleware } from '../../middlewares/addressErrorMiddleware/addressErrorMiddleware';

const addressesEndpoint = '/addresses';
const addressEndpoint = `${addressesEndpoint}/:id`;

export class AddressControllerImpl implements AddressController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      addressesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAddressResponse = await this.createAddress(request, response);
        response.locals['controllerResponse'] = createAddressResponse;
        next();
      }),
    );
    this.router.get(
      addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAddressResponse = await this.findAddress(request, response);
        response.locals['controllerResponse'] = findAddressResponse;
        next();
      }),
    );
    this.router.get(
      addressesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAddressesResponse = await this.findAddresses(request, response);
        response.locals['controllerResponse'] = findAddressesResponse;
        next();
      }),
    );
    this.router.delete(
      addressEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAddressResponse = await this.deleteAddress(request, response);
        response.locals['controllerResponse'] = deleteAddressResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(addressErrorMiddleware);
  }

  public async createAddress(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

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

    const address = await unitOfWork.runInTransaction(async () => {
      return this.addressService.createAddress(unitOfWork, {
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
    });

    return { data: { address }, statusCode: StatusCodes.CREATED };
  }

  public async findAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const address = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = response.locals['authPayload'];

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer(unitOfWork, { userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerAddress = await this.addressService.findAddress(unitOfWork, id as string);

      if (customerAddress.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromAddressError({
          customerId: customer.id,
          targetCustomerId: customerAddress.customerId as string,
        });
      }

      return customerAddress;
    });

    return { data: { address }, statusCode: StatusCodes.OK };
  }

  public async findAddresses(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findAddressesFilters);

    const paginationData = this.paginationDataParser.parse(request.query);

    const addresses = await unitOfWork.runInTransaction(async () => {
      return this.addressService.findAddresses(unitOfWork, filters, paginationData);
    });

    return { data: { addresses }, statusCode: StatusCodes.OK };
  }

  public async deleteAddress(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.addressService.removeAddress(unitOfWork, id as string);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }
}
