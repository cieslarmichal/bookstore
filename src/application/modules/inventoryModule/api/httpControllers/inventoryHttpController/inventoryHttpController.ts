import {
  createInventoryBodySchema,
  createInventoryResponseCreatedBodySchema,
  CreateInventoryBody,
  CreateInventoryResponseCreatedBody,
} from './schemas/createInventorySchema';
import {
  deleteInventoryPathParametersSchema,
  deleteInventoryResponseNoContentBodySchema,
  DeleteInventoryPathParameters,
  DeleteInventoryResponseNoContentBody,
} from './schemas/deleteInventorySchema';
import {
  FindInventoriesQueryParameters,
  FindInventoriesResponseOkBody,
  findInventoriesQueryParametersSchema,
  findInventoriesResponseOkBodySchema,
} from './schemas/findInventoriesSchema';
import {
  FindInventoryPathParameters,
  FindInventoryResponseOkBody,
  findInventoryPathParametersSchema,
  findInventoryResponseOkBodySchema,
} from './schemas/findInventorySchema';
import {
  updateInventoryPathParametersSchema,
  updateInventoryBodySchema,
  updateInventoryResponseOkBodySchema,
  UpdateInventoryBody,
  UpdateInventoryPathParameters,
  UpdateInventoryResponseOkBody,
} from './schemas/updateInventorySchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { PaginationDataBuilder } from '../../../../../../common/paginationDataBuilder/paginationDataBuilder';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CreateInventoryCommandHandler } from '../../../application/commandHandlers/createInventoryCommandHandler/createInventoryCommandHandler';
import { DeleteInventoryCommandHandler } from '../../../application/commandHandlers/deleteInventoryCommandHandler/deleteInventoryCommandHandler';
import { UpdateInventoryCommandHandler } from '../../../application/commandHandlers/updateInventoryCommandHandler/updateInventoryCommandHandler';
import { InventoryAlreadyExistsError } from '../../../application/errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../../../application/errors/inventoryNotFoundError';
import { FindInventoriesQueryHandler } from '../../../application/queryHandlers/findInventoriesQueryHandler/findInventoriesQueryHandler';
import { FindInventoryQueryHandler } from '../../../application/queryHandlers/findInventoryQueryHandler/findInventoryQueryHandler';
import { symbols } from '../../../symbols';

@Injectable()
export class InventoryHttpController implements HttpController {
  public readonly basePath = 'inventories';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.createInventoryCommandHandler)
    private readonly createInventoryCommandHandler: CreateInventoryCommandHandler,
    @Inject(symbols.deleteInventoryCommandHandler)
    private readonly deleteInventoryCommandHandler: DeleteInventoryCommandHandler,
    @Inject(symbols.updateInventoryCommandHandler)
    private readonly updateInventoryCommandHandler: UpdateInventoryCommandHandler,
    @Inject(symbols.findInventoryQueryHandler)
    private readonly findInventoryQueryHandler: FindInventoryQueryHandler,
    @Inject(symbols.findInventoriesQueryHandler)
    private readonly findInventoriesQueryHandler: FindInventoriesQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createInventory.bind(this),
        schema: {
          request: {
            body: createInventoryBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createInventoryResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findInventories.bind(this),
        schema: {
          request: {
            queryParams: findInventoriesQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findInventoriesResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findInventory.bind(this),
        schema: {
          request: {
            pathParams: findInventoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findInventoryResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        handler: this.updateInventory.bind(this),
        schema: {
          request: {
            pathParams: updateInventoryPathParametersSchema,
            body: updateInventoryBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: updateInventoryResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteInventory.bind(this),
        schema: {
          request: {
            pathParams: deleteInventoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteInventoryResponseNoContentBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async createInventory(
    request: HttpRequest<CreateInventoryBody>,
  ): Promise<
    HttpCreatedResponse<CreateInventoryResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { bookId, quantity } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { inventory } = await unitOfWork.runInTransaction(async () => {
        return this.createInventoryCommandHandler.execute({ unitOfWork, draft: { bookId, quantity } });
      });

      return { statusCode: HttpStatusCode.created, body: { inventory } };
    } catch (error) {
      if (error instanceof InventoryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async findInventory(
    request: HttpRequest<undefined, undefined, FindInventoryPathParameters>,
  ): Promise<HttpOkResponse<FindInventoryResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { inventory } = await unitOfWork.runInTransaction(async () => {
        return this.findInventoryQueryHandler.execute({ unitOfWork, inventoryId: id });
      });

      return { statusCode: HttpStatusCode.ok, body: { inventory } };
    } catch (error) {
      if (error instanceof InventoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async findInventories(
    request: HttpRequest<undefined, FindInventoriesQueryParameters>,
  ): Promise<HttpOkResponse<FindInventoriesResponseOkBody>> {
    const { limit, page, bookId } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: Number(page) || 0, limit: Number(limit) || 0 });

    const unitOfWork = await this.unitOfWorkFactory.create();

    const { inventories } = await unitOfWork.runInTransaction(async () => {
      return this.findInventoriesQueryHandler.execute({ unitOfWork, pagination, bookId });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: inventories } };
  }

  private async updateInventory(
    request: HttpRequest<UpdateInventoryBody, undefined, UpdateInventoryPathParameters>,
  ): Promise<HttpOkResponse<UpdateInventoryResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const { quantity } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { inventory } = await unitOfWork.runInTransaction(async () => {
        return this.updateInventoryCommandHandler.execute({ unitOfWork, inventoryId: id, draft: { quantity } });
      });

      return { statusCode: HttpStatusCode.ok, body: { inventory } };
    } catch (error) {
      if (error instanceof InventoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteInventory(
    request: HttpRequest<undefined, undefined, DeleteInventoryPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteInventoryResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteInventoryCommandHandler.execute({ unitOfWork, inventoryId: id });
      });
    } catch (error) {
      if (error instanceof InventoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
