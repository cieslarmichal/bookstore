import express, { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../../domain/category/services/categoryService';
import { CreateCategoryData } from '../../domain/category/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { categoryErrorMiddleware } from './middlewares';
import {
  CreateCategoryBodyDto,
  CreateCategoryResponseData,
  CreateCategoryResponseDto,
  FindCategoryParamDto,
  FindCategoryResponseData,
  FindCategoryResponseDto,
  RemoveCategoryParamDto,
  RemoveCategoryResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, sendResponseMiddleware } from '../shared';

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
    const createCategoryBodyDto = RecordToInstanceTransformer.transform(request.body, CreateCategoryBodyDto);

    const createCategoryData = RecordToInstanceTransformer.transform(createCategoryBodyDto, CreateCategoryData);

    const categoryDto = await this.categoryService.createCategory(createCategoryData);

    const responseData = new CreateCategoryResponseData(categoryDto);

    return new CreateCategoryResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, FindCategoryParamDto);

    const categoryDto = await this.categoryService.findCategory(id);

    const responseData = new FindCategoryResponseData(categoryDto);

    return new FindCategoryResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteCategory(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, RemoveCategoryParamDto);

    await this.categoryService.removeCategory(id);

    return new RemoveCategoryResponseDto(StatusCodes.NO_CONTENT);
  }
}
