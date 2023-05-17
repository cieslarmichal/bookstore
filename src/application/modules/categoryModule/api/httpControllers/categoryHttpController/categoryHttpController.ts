import {
  createCategoryBodySchema,
  createCategoryResponseCreatedBodySchema,
  CreateCategoryBody,
  CreateCategoryResponseCreatedBody,
} from './schemas/createCategorySchema';
import {
  deleteCategoryPathParametersSchema,
  deleteCategoryResponseNoContentBodySchema,
  DeleteCategoryPathParameters,
  DeleteCategoryResponseNoContentBody,
} from './schemas/deleteCategorySchema';
import { findCategoriesFilters } from './schemas/findCategoriesFilters';
import {
  FindCategoriesQueryParameters,
  FindCategoriesResponseOkBody,
  findCategoriesQueryParametersSchema,
  findCategoriesResponseOkBodySchema,
} from './schemas/findCategoriesSchema';
import {
  FindCategoryPathParameters,
  FindCategoryResponseOkBody,
  findCategoryPathParametersSchema,
  findCategoryResponseOkBodySchema,
} from './schemas/findCategorySchema';
import { FilterDataParser } from '../../../../../../common/filterDataParser/filterDataParser';
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
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { CustomerIdNotProvidedError } from '../../../../addressModule/infrastructure/errors/customerIdNotProvidedError';
import { CategoryService } from '../../../application/services/categoryService/categoryService';
import { categoryModuleSymbols } from '../../../categoryModuleSymbols';
import { Category } from '../../../domain/entities/category/category';
import { CategoryAlreadyExistsError } from '../../errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../errors/categoryNotFoundError';

export class CategoryHttpController implements HttpController {
  public readonly basePath = 'categories';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(categoryModuleSymbols.categoryService)
    private readonly categoryService: CategoryService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createCategory.bind(this),
        schema: {
          request: {
            body: createCategoryBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createCategoryResponseCreatedBodySchema,
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
        handler: this.findCategories.bind(this),
        schema: {
          request: {
            queryParams: findCategoriesQueryParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findCategoriesResponseOkBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findCategory.bind(this),
        schema: {
          request: {
            pathParams: findCategoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findCategoryResponseOkBodySchema,
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
        handler: this.deleteCategory.bind(this),
        schema: {
          request: {
            pathParams: deleteCategoryPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteCategoryResponseNoContentBodySchema,
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

  private async createCategory(
    request: HttpRequest<CreateCategoryBody>,
  ): Promise<
    HttpCreatedResponse<CreateCategoryResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { name } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let category: Category | undefined;

    try {
      category = await unitOfWork.runInTransaction(async () => {
        return this.categoryService.createCategory({ unitOfWork, draft: { name } });
      });
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { category } };
  }

  private async findCategory(
    request: HttpRequest<undefined, undefined, FindCategoryPathParameters>,
  ): Promise<HttpOkResponse<FindCategoryResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let category: Category | undefined;

    try {
      category = await unitOfWork.runInTransaction(async () => {
        return this.categoryService.findCategory({ unitOfWork, categoryId: id });
      });
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { category } };
  }

  private async findCategories(
    request: HttpRequest<undefined, FindCategoriesQueryParameters>,
  ): Promise<HttpOkResponse<FindCategoriesResponseOkBody>> {
    const { filter, limit, page } = request.queryParams;

    const pagination = PaginationDataBuilder.build({ page: page ?? 0, limit: limit ?? 0 });

    const filters = filter
      ? FilterDataParser.parse({
          jsonData: filter as string,
          supportedFieldsFilters: findCategoriesFilters,
        })
      : [];

    if (!filters.length) {
      throw new CustomerIdNotProvidedError();
    }

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.categoryService.findCategories({ unitOfWork, filters, pagination });
    });

    return { statusCode: HttpStatusCode.ok, body: { data: categories } };
  }

  private async deleteCategory(
    request: HttpRequest<undefined, undefined, DeleteCategoryPathParameters>,
  ): Promise<HttpNoContentResponse<DeleteCategoryResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { id } = request.pathParams;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.categoryService.deleteCategory({ unitOfWork, categoryId: id });
      });
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
