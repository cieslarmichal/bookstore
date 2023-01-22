import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { BookService } from '../../../../../domain/book/contracts/services/bookService/bookService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { BookController } from '../../../contracts/controllers/bookController/bookController';
import { findBooksFilters } from '../../../contracts/controllers/bookController/findBooksFilters';
import { bookErrorMiddleware } from '../../middlewares/bookErrorMiddleware/bookErrorMiddleware';

const booksEndpoint = '/books';
const bookEndpoint = `${booksEndpoint}/:id`;

export class BookControllerImpl implements BookController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly bookService: BookService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      booksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createBookResponse = await this.createBook(request, response);
        response.locals['controllerResponse'] = createBookResponse;
        next();
      }),
    );
    this.router.get(
      bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookResponse = await this.findBook(request, response);
        response.locals['controllerResponse'] = findBookResponse;
        next();
      }),
    );
    this.router.get(
      booksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBooksResponse = await this.findBooks(request, response);
        response.locals['controllerResponse'] = findBooksResponse;
        next();
      }),
    );
    this.router.patch(
      bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const updateBookResponse = await this.updateBook(request, response);
        response.locals['controllerResponse'] = updateBookResponse;
        next();
      }),
    );
    this.router.delete(
      bookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteBookResponse = await this.deleteBook(request, response);
        response.locals['controllerResponse'] = deleteBookResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(bookErrorMiddleware);
  }

  public async createBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { title, releaseYear, language, format, description, price } = request.body;

    const book = await unitOfWork.runInTransaction(async () => {
      return this.bookService.createBook(unitOfWork, {
        title,
        releaseYear,
        language,
        format,
        description,
        price,
      });
    });

    return { data: { book }, statusCode: StatusCodes.CREATED };
  }

  public async findBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const book = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBook(unitOfWork, id as string);
    });

    return { data: { book }, statusCode: StatusCodes.OK };
  }

  public async findBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findBooksFilters);

    const paginationData = this.paginationDataParser.parse(request.query);

    const books = await unitOfWork.runInTransaction(async () => {
      return this.bookService.findBooks(unitOfWork, filters, paginationData);
    });

    return { data: { books }, statusCode: StatusCodes.OK };
  }

  public async updateBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    const { description, price } = request.body;

    const book = await unitOfWork.runInTransaction(async () => {
      return this.bookService.updateBook(unitOfWork, id as string, { description, price });
    });

    return { data: { book }, statusCode: StatusCodes.OK };
  }

  public async deleteBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.bookService.removeBook(unitOfWork, id as string);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }
}
