/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { AuthorBookService } from '../../../../../domain/authorBook/contracts/services/authorBookService/authorBookService';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { findAuthorsFilters } from '../../../../author/contracts/controllers/authorController/findAuthorsFilters';
import { findBooksFilters } from '../../../../book/contracts/controllers/bookController/findBooksFilters';
import { FilterDataParser } from '../../../../common/filter/filterDataParser';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { PaginationDataParser } from '../../../../common/pagination/paginationDataParser';
import { ControllerResponse } from '../../../../controllerResponse';
import { AuthorBookController } from '../../../contracts/controllers/authorBookController/authorBookController';
import { authorBookErrorMiddleware } from '../../middlewares/authorBookErrorMiddleware/authorBookErrorMiddleware';

const authorBooksEndpoint = '/authors/:authorId/books';
const authorBookEndpoint = `${authorBooksEndpoint}/:bookId`;
const bookAuthorsEndpoint = '/books/:bookId/authors';

export class AuthorBookControllerImpl implements AuthorBookController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorBookService: AuthorBookService,
    authMiddleware: AuthMiddleware,
    private filterDataParser: FilterDataParser,
    private paginationDataParser: PaginationDataParser,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      authorBookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAuthorBookResponse = await this.createAuthorBook(request, response);
        response.locals['controllerResponse'] = createAuthorBookResponse;
        next();
      }),
    );
    this.router.delete(
      authorBookEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAuthorBookResponse = await this.deleteAuthorBook(request, response);
        response.locals['controllerResponse'] = deleteAuthorBookResponse;
        next();
      }),
    );
    this.router.get(
      authorBooksEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorBooksResponse = await this.findAuthorBooks(request, response);
        response.locals['controllerResponse'] = findAuthorBooksResponse;
        next();
      }),
    );
    this.router.get(
      bookAuthorsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookAuthorsResponse = await this.findBookAuthors(request, response);
        response.locals['controllerResponse'] = findBookAuthorsResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(authorBookErrorMiddleware);
  }

  public async createAuthorBook(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authorId, bookId } = request.params;

    const authorBook = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.createAuthorBook(unitOfWork, {
        authorId: authorId as string,
        bookId: bookId as string,
      });
    });

    return { data: { authorBook }, statusCode: StatusCodes.CREATED };
  }

  public async findAuthorBooks(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authorId } = request.params;

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findBooksFilters);

    const paginationData = this.paginationDataParser.parse(request.query);

    const books = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findAuthorBooks(unitOfWork, authorId as string, filters, paginationData);
    });

    return { data: { books }, statusCode: StatusCodes.OK };
  }

  public async findBookAuthors(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId } = request.params;

    const filters = this.filterDataParser.parse(request.query['filter'] as string, findAuthorsFilters);

    const paginationData = this.paginationDataParser.parse(request.query);

    const authors = await unitOfWork.runInTransaction(async () => {
      return this.authorBookService.findBookAuthors(unitOfWork, bookId as string, filters, paginationData);
    });

    return { data: { authors }, statusCode: StatusCodes.OK };
  }

  public async deleteAuthorBook(request: Request, _response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authorId, bookId } = request.params;

    await unitOfWork.runInTransaction(async () => {
      await this.authorBookService.removeAuthorBook(unitOfWork, {
        authorId: authorId as string,
        bookId: bookId as string,
      });
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }
}
