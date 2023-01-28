/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { CategoryService } from '../../../../../domain/category/contracts/services/categoryService/categoryService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/paginationData/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { CategoryController } from '../../../contracts/controllers/categoryController/categoryController';
import { findCategoriesFilters } from '../../../contracts/controllers/categoryController/findCategoriesFilters';
import { categoryErrorMiddleware } from '../../middlewares/categoryErrorMiddleware/categoryErrorMiddleware';

const categoriesEndpoint = '/categories';
const categoryEndpoint = `${categoriesEndpoint}/:id`;

export class CategoryControllerImpl implements CategoryController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly categoryService: CategoryService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      categoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createCategoryResponse = await this.createCategory(request, response);
        response.locals['controllerResponse'] = createCategoryResponse;
        next();
      }),
    );
    this.router.get(
      categoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoryResponse = await this.findCategory(request, response);
        response.locals['controllerResponse'] = findCategoryResponse;
        next();
      }),
    );
    this.router.get(
      categoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoriesResponse = await this.findCategories(request, response);
        response.locals['controllerResponse'] = findCategoriesResponse;
        next();
      }),
    );
    this.router.delete(
      categoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteCategoryResponse = await this.deleteCategory(request, response);
        response.locals['controllerResponse'] = deleteCategoryResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(categoryErrorMiddleware);
  }

  public async createCategory(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { name } = request.body;

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.createCategory(unitOfWork, { name });
    });

    return { data: { category }, statusCode: HttpStatusCode.created };
  }

  public async findCategory(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategory(unitOfWork, id as string);
    });

    return { data: { category }, statusCode: HttpStatusCode.ok };
  }

  public async findCategories(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findCategoriesFilters);

    const pagination = this.paginationDataParser.parse(request.query);

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategories(unitOfWork, filters, pagination);
    });

    return { data: { categories }, statusCode: HttpStatusCode.ok };
  }

  public async deleteCategory(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.categoryService.deleteCategory(unitOfWork, id as string);
    });

    return { statusCode: HttpStatusCode.noContent };
  }
}
