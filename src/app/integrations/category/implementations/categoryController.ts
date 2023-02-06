/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { categoryErrorMiddleware } from './categoryErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Category } from '../../../domain/category/contracts/category';
import { CategoryService } from '../../../domain/category/contracts/services/categoryService/categoryService';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { FilterDataParser } from '../../common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../controllerResponse';
import { LocalsName } from '../../localsName';
import { QueryParameterName } from '../../queryParameterName';
import { CreateCategoryPayload, createCategoryPayloadSchema } from '../contracts/createCategoryPayload';
import { DeleteCategoryPayload, deleteCategoryPayloadSchema } from '../contracts/deleteCategoryPayload';
import { findCategoriesFilters } from '../contracts/findCategoriesFilters';
import { FindCategoriesPayload, findCategoriesPayloadSchema } from '../contracts/findCategoriesPayload';
import { FindCategoryPayload, findCategoryPayloadSchema } from '../contracts/findCategoryPayload';

export class CategoryController {
  public readonly router = Router();
  private readonly categoriesEndpoint = '/categories';
  private readonly categoryEndpoint = `${this.categoriesEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly categoryService: CategoryService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.categoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { name } = request.body;

        const category = await this.createCategory({ name });

        const controllerResponse: ControllerResponse = { data: { category }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.categoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const category = await this.findCategory({ id: id as string });

        const controllerResponse: ControllerResponse = { data: { category }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.categoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const filters = this.filterDataParser.parse({
          jsonData: request.query[QueryParameterName.filter] as string,
          supportedFieldsFilters: findCategoriesFilters,
        });

        const page = Number(request.query[QueryParameterName.page]);

        const limit = Number(request.query[QueryParameterName.limit]);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const categories = await this.findCategories({ filters, pagination });

        const controllerResponse: ControllerResponse = { data: { categories }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.categoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        await this.deleteCategory({ id: id as string });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(categoryErrorMiddleware);
  }

  private async createCategory(input: CreateCategoryPayload): Promise<Category> {
    const { name } = PayloadFactory.create(createCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.createCategory({ unitOfWork, draft: { name } });
    });

    return category;
  }

  private async findCategory(input: FindCategoryPayload): Promise<Category> {
    const { id } = PayloadFactory.create(findCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategory({ unitOfWork, categoryId: id });
    });

    return category;
  }

  private async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { filters, pagination } = PayloadFactory.create(findCategoriesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategories({ unitOfWork, filters, pagination });
    });

    return categories;
  }

  private async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.categoryService.deleteCategory({ unitOfWork, categoryId: id });
    });
  }
}