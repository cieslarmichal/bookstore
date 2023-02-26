import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { inventoryErrorMiddleware } from './inventoryErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Inventory } from '../../../domain/inventory/contracts/inventory';
import { InventoryService } from '../../../domain/inventory/contracts/services/inventoryService/inventoryService';
import { inventorySymbols } from '../../../domain/inventory/inventorySymbols';
import { Injectable, Inject } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateInventoryPayload, createInventoryPayloadSchema } from '../contracts/createInventoryPayload';
import { DeleteInventoryPayload, deleteInventoryPayloadSchema } from '../contracts/deleteInventoryPayload';
import { FindInventoriesPayload, findInventoriesPayloadSchema } from '../contracts/findInventoriesPayload';
import { FindInventoryPayload, findInventoryPayloadSchema } from '../contracts/findInventoryPayload';
import { UpdateInventoryPayload, updateInventoryPayloadSchema } from '../contracts/updateInventoryPayload';

@Injectable()
export class InventoryController {
  public readonly router = Router();
  private readonly inventoriesEndpoint = '/inventories';
  private readonly inventoryEndpoint = `${this.inventoriesEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(inventorySymbols.inventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.inventoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId, quantity } = request.body;

        const inventory = await this.createInventory({ bookId, quantity });

        const controllerResponse: ControllerResponse = { data: { inventory }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.inventoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const inventory = await this.findInventory({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { inventory }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.inventoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const inventories = await this.findInventories({ pagination });

        const controllerResponse: ControllerResponse = { data: { inventories }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.inventoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { quantity } = request.body;

        const inventory = await this.updateInventory({ id: id as string, quantity });

        const controllerResponse: ControllerResponse = { data: { inventory }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.inventoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteInventory({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(inventoryErrorMiddleware);
  }

  private async createInventory(input: CreateInventoryPayload): Promise<Inventory> {
    const { bookId, quantity } = PayloadFactory.create(createInventoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const inventory = await unitOfWork.runInTransaction(async () => {
      return this.inventoryService.createInventory({ unitOfWork, draft: { bookId, quantity } });
    });

    return inventory;
  }

  private async findInventory(input: FindInventoryPayload): Promise<Inventory> {
    const { id } = PayloadFactory.create(findInventoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const inventory = await unitOfWork.runInTransaction(async () => {
      return this.inventoryService.findInventory({ unitOfWork, inventoryId: id });
    });

    return inventory;
  }

  private async findInventories(input: FindInventoriesPayload): Promise<Inventory[]> {
    const { pagination } = PayloadFactory.create(findInventoriesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const inventories = await unitOfWork.runInTransaction(async () => {
      return this.inventoryService.findInventories({ unitOfWork, pagination });
    });

    return inventories;
  }

  private async updateInventory(input: UpdateInventoryPayload): Promise<Inventory> {
    const { id, quantity } = PayloadFactory.create(updateInventoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const inventory = await unitOfWork.runInTransaction(async () => {
      return this.inventoryService.updateInventory({ unitOfWork, inventoryId: id, draft: { quantity } });
    });

    return inventory;
  }

  private async deleteInventory(input: DeleteInventoryPayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteInventoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.inventoryService.deleteInventory({ unitOfWork, inventoryId: id });
    });
  }
}