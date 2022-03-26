import express, { NextFunction, Request, Response } from 'express';
import { AddressService } from '../../domain/address/services/addressService';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { addressErrorMiddleware } from './middlewares';
import {
  CreateAddressBodyDto,
  CreateAddressResponseData,
  CreateAddressResponseDto,
  FindAddressParamDto,
  FindAddressResponseData,
  FindAddressResponseDto,
  RemoveAddressParamDto,
  RemoveAddressResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, sendResponseMiddleware } from '../shared';

const ADDRESSES_PATH = '/addresses';
const ADDRESSES_PATH_WITH_ID = `${ADDRESSES_PATH}/:id`;

export class AddressController {
  public readonly router = express.Router();

  public constructor(private readonly addressService: AddressService, authMiddleware: AuthMiddleware) {
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
    const createAddressBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateAddressBodyDto);

    const addressDto = await this.addressService.createAddress(createAddressBodyDto);

    const responseData = new CreateAddressResponseData(addressDto);

    return new CreateAddressResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindAddressParamDto);

    const addressDto = await this.addressService.findAddress(id);

    const responseData = new FindAddressResponseData(addressDto);

    return new FindAddressResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAddress(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveAddressParamDto);

    await this.addressService.removeAddress(id);

    return new RemoveAddressResponseDto(StatusCodes.NO_CONTENT);
  }
}
