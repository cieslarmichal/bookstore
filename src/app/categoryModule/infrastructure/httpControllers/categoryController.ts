import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { categoryErrorMiddleware } from './categoryErrorMiddleware';
import { CreateCategoryPayload, createCategoryPayloadSchema } from './payloads/createCategoryPayload';
import { DeleteCategoryPayload, deleteCategoryPayloadSchema } from './payloads/deleteCategoryPayload';
import { findCategoriesFilters } from './payloads/findCategoriesFilters';
import { FindCategoriesPayload, findCategoriesPayloadSchema } from './payloads/findCategoriesPayload';
import { FindCategoryPayload, findCategoryPayloadSchema } from './payloads/findCategoryPayload';
import { FilterDataParser } from '../../../../common/filterDataParser/filterDataParser';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { PaginationDataBuilder } from '../../../../common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../../common/types/contracts/controllerResponse';
import { LocalsName } from '../../../../common/types/contracts/localsName';
import { QueryParameterName } from '../../../../common/types/contracts/queryParameterName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../../libs/unitOfWork/unitOfWorkSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { AuthMiddleware } from '../../../integrations/common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../integrations/common/middlewares/sendResponseMiddleware';
import { CategoryService } from '../../application/services/categoryService/categoryService';
import { categoryModuleSymbols } from '../../categoryModuleSymbols';
import { Category } from '../../domain/entities/category/category';

@Injectable()
export class CategoryController {
  public readonly router = Router();
  private readonly categoriesEndpoint = '/categories';
  private readonly categoryEndpoint = `${this.categoriesEndpoint}/:id`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(categoryModuleSymbols.categoryService)
    private readonly categoryService: CategoryService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
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
        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findCategoriesFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

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
    const { name } = Validator.validate(createCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.createCategory({ unitOfWork, draft: { name } });
    });

    return category;
  }

  private async findCategory(input: FindCategoryPayload): Promise<Category> {
    const { id } = Validator.validate(findCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const category = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategory({ unitOfWork, categoryId: id });
    });

    return category;
  }

  private async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { filters, pagination } = Validator.validate(findCategoriesPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategories({ unitOfWork, filters, pagination });
    });

    return categories;
  }

  private async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { id } = Validator.validate(deleteCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.categoryService.deleteCategory({ unitOfWork, categoryId: id });
    });
  }
}
