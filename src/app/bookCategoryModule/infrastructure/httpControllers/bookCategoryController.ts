import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { bookCategoryErrorMiddleware } from './bookCategoryErrorMiddleware';
import { CreateBookCategoryPayload, createBookCategoryPayloadSchema } from './payloads/createBookCategoryPayload';
import { DeleteBookCategoryPayload, deleteBookCategoryPayloadSchema } from './payloads/deleteBookCategoryPayload';
import {
  FindBooksByCategoryIdPayload,
  findBooksByCategoryIdPayloadSchema,
} from './payloads/findBooksByCategoryIdPayload';
import {
  FindCategoriesByBookIdPayload,
  findCategoriesByBookIdPayloadSchema,
} from './payloads/findCategoriesByBookIdPayload';
import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../../libs/unitOfWork/unitOfWorkSymbols';
import { Validator } from '../../../../libs/validator/implementations/validator';
import { Book } from '../../../bookModule/domain/entities/book/book';
import { findBooksFilters } from '../../../bookModule/infrastructure/httpControllers/payloads/findBooksFilters';
import { Category } from '../../../categoryModule/domain/entities/category/category';
import { findCategoriesFilters } from '../../../integrations/category/contracts/findCategoriesFilters';
import { FilterDataParser } from '../../../integrations/common/filterDataParser/filterDataParser';
import { AuthMiddleware } from '../../../integrations/common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../integrations/common/middlewares/sendResponseMiddleware';
import { PaginationDataBuilder } from '../../../integrations/common/paginationDataBuilder/paginationDataBuilder';
import { ControllerResponse } from '../../../integrations/controllerResponse';
import { LocalsName } from '../../../integrations/localsName';
import { QueryParameterName } from '../../../integrations/queryParameterName';
import { BookCategoryService } from '../../application/services/bookCategoryService/bookCategoryService';
import { bookCategoryModuleSymbols } from '../../bookCategoryModuleSymbols';
import { BookCategory } from '../../domain/entities/bookCategory/bookCategory';

@Injectable()
export class BookCategoryController {
  public readonly router = Router();
  private readonly bookCategoriesEndpoint = '/books/:bookId/categories';
  private readonly bookCategoryEndpoint = `${this.bookCategoriesEndpoint}/:categoryId`;
  private readonly categoryBooksEndpoint = '/categories/:categoryId/books';

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(bookCategoryModuleSymbols.bookCategoryService)
    private readonly bookCategoryService: BookCategoryService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
    @Inject(integrationsSymbols.filterDataParser)
    private filterDataParser: FilterDataParser,
    @Inject(integrationsSymbols.paginationDataBuilder)
    private paginationDataBuilder: PaginationDataBuilder,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId, categoryId } = request.params;

        const bookCategory = await this.createBookCategory({
          bookId: bookId as string,
          categoryId: categoryId as string,
        });

        const controllerResponse: ControllerResponse = { data: { bookCategory }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.bookCategoriesEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId } = request.params;

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

        const categories = await this.findCategoriesByBookId({
          bookId: bookId as string,
          filters,
          pagination,
        });

        const controllerResponse: ControllerResponse = { data: { categories }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.categoryBooksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { categoryId } = request.params;

        const filtersInput = request.query[QueryParameterName.filter] as string;

        const filters = filtersInput
          ? this.filterDataParser.parse({
              jsonData: filtersInput,
              supportedFieldsFilters: findBooksFilters,
            })
          : [];

        const page = Number(request.query[QueryParameterName.page] ?? 0);

        const limit = Number(request.query[QueryParameterName.limit] ?? 0);

        const pagination = this.paginationDataBuilder.build({ page, limit });

        const books = await this.findBooksByCategoryId({
          categoryId: categoryId as string,
          filters,
          pagination,
        });

        const controllerResponse: ControllerResponse = { data: { books }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.bookCategoryEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { bookId, categoryId } = request.params;

        await this.deleteBookCategory({
          bookId: bookId as string,
          categoryId: categoryId as string,
        });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(bookCategoryErrorMiddleware);
  }

  private async createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory> {
    const { bookId, categoryId } = Validator.validate(createBookCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const bookCategory = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.createBookCategory({
        unitOfWork,
        draft: {
          bookId,
          categoryId,
        },
      });
    });

    return bookCategory;
  }

  private async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { bookId, filters, pagination } = Validator.validate(findCategoriesByBookIdPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const categories = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findCategoriesByBookId({ unitOfWork, bookId, filters, pagination });
    });

    return categories;
  }

  private async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { categoryId, pagination, filters } = Validator.validate(findBooksByCategoryIdPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookCategoryService.findBooksByCategoryId({ unitOfWork, categoryId, filters, pagination });
    });

    return books;
  }

  private async deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void> {
    const { bookId, categoryId } = Validator.validate(deleteBookCategoryPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      await this.bookCategoryService.deleteBookCategory({
        unitOfWork,
        bookId,
        categoryId,
      });
    });
  }
}