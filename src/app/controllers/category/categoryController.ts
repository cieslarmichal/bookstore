import express, { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../../domain/category/services/categoryService';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { categoryErrorMiddleware } from './middlewares';
import {
  CreateCategoryBodyDto,
  CreateCategoryResponseData,
  CreateCategoryResponseDto,
  FindCategoriesQueryDto,
  FindCategoriesResponseData,
  FindCategoriesResponseDto,
  FindCategoryParamDto,
  FindCategoryResponseData,
  FindCategoryResponseDto,
  RemoveCategoryParamDto,
  RemoveCategoryResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, PaginationDataParser, sendResponseMiddleware } from '../shared';

const CATEGORIES_PATH = '/categories';
const CATEGORIES_PATH_WITH_ID = `${CATEGORIES_PATH}/:id`;

export class CategoryController {
  public readonly router = express.Router();

  public constructor(private readonly categoryService: CategoryService, authMiddleware: AuthMiddleware) {
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
    const createCategoryBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateCategoryBodyDto);

    const categoryDto = await this.categoryService.createCategory(createCategoryBodyDto);

    const responseData = new CreateCategoryResponseData(categoryDto);

    return new CreateCategoryResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindCategoryParamDto);

    const categoryDto = await this.categoryService.findCategory(id);

    const responseData = new FindCategoryResponseData(categoryDto);

    return new FindCategoryResponseDto(responseData, StatusCodes.OK);
  }

  public async findCategories(request: Request, response: Response): Promise<ControllerResponse> {
    const findCategoriesQueryDto = RecordToInstanceTransformer.transform(request.query, FindCategoriesQueryDto);

    const paginationData = PaginationDataParser.parse(request.query);

    const categoryDto = await this.categoryService.findCategories(findCategoriesQueryDto, paginationData);

    const responseData = new FindCategoriesResponseData(categoryDto);

    return new FindCategoriesResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveCategoryParamDto);

    await this.categoryService.removeCategory(id);

    return new RemoveCategoryResponseDto(StatusCodes.NO_CONTENT);
  }
}
