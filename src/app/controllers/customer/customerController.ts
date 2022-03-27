import express, { NextFunction, Request, Response } from 'express';
import { CustomerService } from '../../domain/customer/services/customerService';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { customerErrorMiddleware } from './middlewares';
import {
  CreateCustomerBodyDto,
  CreateCustomerResponseData,
  CreateCustomerResponseDto,
  FindCustomerParamDto,
  FindCustomerResponseData,
  FindCustomerResponseDto,
  RemoveCustomerParamDto,
  RemoveCustomerResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, sendResponseMiddleware } from '../shared';

const CUSTOMERS_PATH = '/customers';
const CUSTOMERS_PATH_WITH_ID = `${CUSTOMERS_PATH}/:id`;

export class CustomerController {
  public readonly router = express.Router();

  public constructor(private readonly customerService: CustomerService, authMiddleware: AuthMiddleware) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      CUSTOMERS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createCustomerResponse = await this.createCustomer(request, response);
        response.locals.controllerResponse = createCustomerResponse;
        next();
      }),
    );
    this.router.get(
      CUSTOMERS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCustomerResponse = await this.findCustomer(request, response);
        response.locals.controllerResponse = findCustomerResponse;
        next();
      }),
    );
    this.router.delete(
      CUSTOMERS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteCustomerResponse = await this.deleteCustomer(request, response);
        response.locals.controllerResponse = deleteCustomerResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(customerErrorMiddleware);
  }

  public async createCustomer(request: Request, response: Response): Promise<ControllerResponse> {
    const createCustomerBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateCustomerBodyDto);

    const customerDto = await this.customerService.createCustomer(createCustomerBodyDto);

    const responseData = new CreateCustomerResponseData(customerDto);

    return new CreateCustomerResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findCustomer(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindCustomerParamDto);

    const customerDto = await this.customerService.findCustomer({ id });

    const responseData = new FindCustomerResponseData(customerDto);

    return new FindCustomerResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteCustomer(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveCustomerParamDto);

    await this.customerService.removeCustomer(id);

    return new RemoveCustomerResponseDto(StatusCodes.NO_CONTENT);
  }
}
