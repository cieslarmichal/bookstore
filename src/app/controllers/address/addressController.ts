import express, { NextFunction, Request, Response } from 'express';
import { AddressService } from '../../domain/address/services/addressService';
import { RecordToInstanceTransformer, UnitOfWorkFactory } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { addressErrorMiddleware } from './middlewares';
import {
  CreateAddressBodyDto,
  CreateAddressResponseData,
  CreateAddressResponseDto,
  FindAddressesResponseData,
  FindAddressesResponseDto,
  FindAddressParamDto,
  FindAddressResponseData,
  FindAddressResponseDto,
  RemoveAddressParamDto,
  RemoveAddressResponseDto,
  supportedFindAddressesFieldsFilters,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, FilterDataParser, PaginationDataParser, sendResponseMiddleware } from '../shared';
import { CustomerService } from '../../domain/customer/services/customerService';
import { UserRole } from '../../domain/user/types';
import { CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddress, UserIsNotACustomer } from './errors';
import { CustomerDto } from 'src/app/domain/customer/dtos';

const ADDRESSES_PATH = '/addresses';
const ADDRESSES_PATH_WITH_ID = `${ADDRESSES_PATH}/:id`;

export class AddressController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      ADDRESSES_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAddressResponse = await this.createAddress(request, response);
        response.locals.controllerResponse = createAddressResponse;
        next();
      }),
    );
    this.router.get(
      ADDRESSES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAddressResponse = await this.findAddress(request, response);
        response.locals.controllerResponse = findAddressResponse;
        next();
      }),
    );
    this.router.get(
      ADDRESSES_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAddressesResponse = await this.findAddresses(request, response);
        response.locals.controllerResponse = findAddressesResponse;
        next();
      }),
    );
    this.router.delete(
      ADDRESSES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAddressResponse = await this.deleteAddress(request, response);
        response.locals.controllerResponse = deleteAddressResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(addressErrorMiddleware);
  }

  public async createAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const createAddressBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateAddressBodyDto);

    const addressDto = await unitOfWork.runInTransaction(async () => {
      const address = await this.addressService.createAddress(createAddressBodyDto);

      return address;
    });

    const responseData = new CreateAddressResponseData(addressDto);

    return new CreateAddressResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindAddressParamDto);

    const addressDto = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = response.locals.authPayload;

      let customer: CustomerDto;

      try {
        customer = await this.customerService.findCustomer({ userId });
      } catch (error) {
        throw new UserIsNotACustomer({ userId });
      }

      const address = await this.addressService.findAddress(id);

      if (address.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddress({
          customerId: customer.id,
          targetCustomerId: address.customerId,
        });
      }

      return address;
    });

    const responseData = new FindAddressResponseData(addressDto);

    return new FindAddressResponseDto(responseData, StatusCodes.OK);
  }

  public async findAddresses(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindAddressesFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const addressesDto = await unitOfWork.runInTransaction(async () => {
      const addresses = await this.addressService.findAddresses(filters, paginationData);

      return addresses;
    });

    const responseData = new FindAddressesResponseData(addressesDto);

    return new FindAddressesResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveAddressParamDto);

    await unitOfWork.runInTransaction(async () => {
      await this.addressService.removeAddress(id);
    });

    return new RemoveAddressResponseDto(StatusCodes.NO_CONTENT);
  }
}
