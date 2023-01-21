import express, { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../../domain/category/services/categoryService';
import { RecordToInstanceTransformer, UnitOfWorkFactory } from '../../common';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { categoryErrorMiddleware } from './middlewares';
import {
  CreateCategoryBodyDto,
  CreateCategoryResponseData,
  CreateCategoryResponseDto,
  FindCategoriesResponseData,
  FindCategoriesResponseDto,
  FindCategoryParamDto,
  FindCategoryResponseData,
  FindCategoryResponseDto,
  RemoveCategoryParamDto,
  RemoveCategoryResponseDto,
  findCategoriesFilters,
} from './dtos';
import { ControllerResponse } from '../controllerResponse';
import { AuthMiddleware, FilterDataParser, PaginationDataParser, sendResponseMiddleware } from '../common';

const CATEGORIES_PATH = '/categories';
const CATEGORIES_PATH_WITH_ID = `${CATEGORIES_PATH}/:id`;

export class CategoryController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly categoryService: CategoryService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      CATEGORIES_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createCategoryResponse = await this.createCategory(request, response);
        response.locals.controllerResponse = createCategoryResponse;
        next();
      }),
    );
    this.router.get(
      CATEGORIES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoryResponse = await this.findCategory(request, response);
        response.locals.controllerResponse = findCategoryResponse;
        next();
      }),
    );
    this.router.get(
      CATEGORIES_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findCategoriesResponse = await this.findCategories(request, response);
        response.locals.controllerResponse = findCategoriesResponse;
        next();
      }),
    );
    this.router.delete(
      CATEGORIES_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteCategoryResponse = await this.deleteCategory(request, response);
        response.locals.controllerResponse = deleteCategoryResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(categoryErrorMiddleware);
  }

  public async createCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const createCategoryBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateCategoryBodyDto);

    const categoryDto = await unitOfWork.runInTransaction(async () => {
      const category = await this.categoryService.createCategory(unitOfWork, createCategoryBodyDto);

      return category;
    });

    const responseData = new CreateCategoryResponseData(categoryDto);

    return new CreateCategoryResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindCategoryParamDto);

    const categoryDto = await unitOfWork.runInTransaction(async () => {
      const category = await this.categoryService.findCategory(unitOfWork, id);

      return category;
    });

    const responseData = new FindCategoryResponseData(categoryDto);

    return new FindCategoryResponseDto(responseData, StatusCodes.OK);
  }

  public async findCategories(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = FilterDataParser.parse(request.query.filter as string, findCategoriesFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const categoriesDto = await unitOfWork.runInTransaction(async () => {
      const categories = await this.categoryService.findCategories(unitOfWork, filters, paginationData);

      return categories;
    });

    const responseData = new FindCategoriesResponseData(categoriesDto);

    return new FindCategoriesResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveCategoryParamDto);

    await unitOfWork.runInTransaction(async () => {
      await this.categoryService.removeCategory(unitOfWork, id);
    });

    return new RemoveCategoryResponseDto(StatusCodes.NO_CONTENT);
  }
}
