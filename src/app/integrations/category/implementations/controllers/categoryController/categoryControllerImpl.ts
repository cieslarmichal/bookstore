/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/contracts/httpStatusCode';
import { Category } from '../../../../../domain/category/contracts/category';
import { CategoryService } from '../../../../../domain/category/contracts/services/categoryService/categoryService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { LocalsName } from '../../../../localsName';
import { QueryParameterName } from '../../../../queryParameterName';
import { CreateCategoryPayload } from '../../../contracts/controllers/categoryController/createCategoryPayload';
import { DeleteCategoryPayload } from '../../../contracts/controllers/categoryController/deleteCategoryPayload';
import { findCategoriesFilters } from '../../../contracts/controllers/categoryController/findCategoriesFilters';
import { FindCategoriesPayload } from '../../../contracts/controllers/categoryController/findCategoriesPayload';
import { FindCategoryPayload } from '../../../contracts/controllers/categoryController/findCategoryPayload';
import { categoryErrorMiddleware } from '../../middlewares/categoryErrorMiddleware/categoryErrorMiddleware';

export class CategoryController {
  public readonly router = Router();
  private readonly categoriesEndpoint = '/categories';
  private readonly categoryEndpoint = `${this.categoriesEndpoint}/:id`;

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly categoryService: CategoryService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
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
        const filters = this.filterDataParser.parse(
          request.query[QueryParameterName.filter] as string,
          findCategoriesFilters,
        );

        const pagination = this.paginationDataParser.parse(request.query);

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
    const { name } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.createCategory({ unitOfWork, draft: { name } });
    });

    return category;
  }

  private async findCategory(input: FindCategoryPayload): Promise<Category> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategory({ unitOfWork, categoryId: id });
    });

    return category;
  }

  private async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { filters, pagination } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategories({ unitOfWork, filters, pagination });
    });

    return categories;
  }

  private async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { id } = input;

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.categoryService.deleteCategory({ unitOfWork, categoryId: id });
    });
  }
}
