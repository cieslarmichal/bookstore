/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { customerErrorMiddleware } from './customerErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { Injectable, Inject } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { CreateCustomerPayload, createCustomerPayloadSchema } from '../contracts/createCustomerPayload';
import { DeleteCustomerPayload, deleteCustomerPayloadSchema } from '../contracts/deleteCustomerPayload';
import { FindCustomerPayload, findCustomerPayloadSchema } from '../contracts/findCustomerPayload';

@Injectable()
export class CustomerController {
  public readonly router = Router();
  private readonly customersEndpoint = '/customers';
  private readonly customerEndpoint = `${this.customersEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
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
    const { userId } = PayloadFactory.create(createCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.createCustomer({ unitOfWork, draft: { userId } });
    });

    return { data: { customer }, statusCode: HttpStatusCode.created };
  }

  private async findCustomer(input: FindCustomerPayload): Promise<ControllerResponse> {
    const { id } = PayloadFactory.create(findCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const customer = await unitOfWork.runInTransaction(async () => {
      return this.customerService.findCustomer({ unitOfWork, customerId: id });
    });

    return { data: { customer }, statusCode: HttpStatusCode.ok };
  }

  private async deleteCustomer(input: DeleteCustomerPayload): Promise<ControllerResponse> {
    const { id } = PayloadFactory.create(deleteCustomerPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.customerService.deleteCustomer({ unitOfWork, customerId: id });
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
