/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { CustomerService } from '../../../../../domain/customer/contracts/services/customerService/customerService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { CreateCustomerPayload } from '../../../contracts/controllers/customerController/createCustomerPayload';
import { DeleteCustomerPayload } from '../../../contracts/controllers/customerController/deleteCustomerPayload';
import { FindCustomerPayload } from '../../../contracts/controllers/customerController/findCustomerPayload';
import { customerErrorMiddleware } from '../../middlewares/customerErrorMiddleware/customerErrorMiddleware';

export class CustomerController {
  public readonly router = Router();
  private readonly customersEndpoint = '/customers';
  private readonly customerEndpoint = `${this.customersEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly customerService: CustomerService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.customersEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.body;

        const customer = await this.createCustomer({ userId });

        const controllerResponse: ControllerResponse = { data: { customer }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const customer = await this.findCustomer({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { customer }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.customerEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteCustomer({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(customerErrorMiddleware);
  }

  private async createCustomer(input: CreateCustomerPayload): Promise<ControllerResponse> {
    const { userId } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.createCustomer({ unitOfWork, draft: { userId } });
    });

    return { data: { customer }, statusCode: HttpStatusCode.created };
  }

  private async findCustomer(input: FindCustomerPayload): Promise<ControllerResponse> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.findCustomer({ unitOfWork, customerId: id });
    });

    return { data: { customer }, statusCode: HttpStatusCode.ok };
  }

  private async deleteCustomer(input: DeleteCustomerPayload): Promise<ControllerResponse> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.customerService.deleteCustomer({ unitOfWork, customerId: id });
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
