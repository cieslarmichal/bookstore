/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { CustomerService } from '../../../../../domain/customer/contracts/services/customerService/customerService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../../../controllerResponse';
import { CustomerController } from '../../../contracts/controllers/customerController/customerController';
import { customerErrorMiddleware } from '../../middlewares/customerErrorMiddleware/customerErrorMiddleware';

const customersEndpoint = '/customers';
const customerEndpoint = `${customersEndpoint}/:id`;

export class CustomerControllerImpl implements CustomerController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly customerService: CustomerService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      customersEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createCustomerResponse = await this.createCustomer(request, response);
        response.locals['controllerResponse'] = createCustomerResponse;
        next();
      }),
    );
    this.router.get(
      customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCustomerResponse = await this.findCustomer(request, response);
        response.locals['controllerResponse'] = findCustomerResponse;
        next();
      }),
    );
    this.router.delete(
      customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteCustomerResponse = await this.deleteCustomer(request, response);
        response.locals['controllerResponse'] = deleteCustomerResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(customerErrorMiddleware);
  }

  public async createCustomer(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { userId } = request.body;

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.createCustomer(unitOfWork, { userId });
    });

    return { data: { customer }, statusCode: HttpStatusCode.created };
  }

  public async findCustomer(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.findCustomer(unitOfWork, { id: id as string });
    });

    return { data: { customer }, statusCode: HttpStatusCode.ok };
  }

  public async deleteCustomer(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.customerService.removeCustomer(unitOfWork, id as string);
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
