import express, { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authorBookErrorMiddleware } from './middlewares';
import {
  CreateAuthorBookParamDto,
  CreateAuthorBookResponseData,
  CreateAuthorBookResponseDto,
  RemoveAuthorBookParamDto,
  RemoveAuthorBookResponseDto,
  FindBookAuthorsParamDto,
  FindBookAuthorsResponseData,
  FindBookAuthorsResponseDto,
  FindAuthorBooksResponseData,
  FindAuthorBooksResponseDto,
  FindAuthorBooksParamDto,
} from './dtos';
import { ControllerResponse } from '../controllerResponse';
import { supportedFindBooksFieldsFilters } from '../book/dtos/findBooksDto';
import { findAuthorsFilters } from '../author/contracts/controllers/authorController/findAuthorsFilters';

const AUTHOR_BOOKS_PATH = '/authors/:authorId/books';
const AUTHOR_BOOKS_PATH_WITH_ID = `${AUTHOR_BOOKS_PATH}/:bookId`;
const BOOK_AUTHORS_PATH = '/books/:bookId/authors';

export class AuthorBookController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorBookService: AuthorBookService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      AUTHOR_BOOKS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAuthorBookResponse = await this.createAuthorBook(request, response);
        response.locals.controllerResponse = createAuthorBookResponse;
        next();
      }),
    );
    this.router.delete(
      AUTHOR_BOOKS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAuthorBookResponse = await this.deleteAuthorBook(request, response);
        response.locals.controllerResponse = deleteAuthorBookResponse;
        next();
      }),
    );
    this.router.get(
      AUTHOR_BOOKS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorBooksResponse = await this.findAuthorBooks(request, response);
        response.locals.controllerResponse = findAuthorBooksResponse;
        next();
      }),
    );
    this.router.get(
      BOOK_AUTHORS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findBookAuthorsResponse = await this.findBookAuthors(request, response);
        response.locals.controllerResponse = findBookAuthorsResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(authorBookErrorMiddleware);
  }

  public async createAuthorBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const createAuthorBookParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      CreateAuthorBookParamDto,
    );

    const createAuthorBookData = RecordToInstanceTransformer.strictTransform(
      createAuthorBookParamDto,
      CreateAuthorBookData,
    );

    const authorBookDto = await unitOfWork.runInTransaction(async () => {
      const authorBook = await this.authorBookService.createAuthorBook(unitOfWork, createAuthorBookData);

      return authorBook;
    });

    const responseData = new CreateAuthorBookResponseData(authorBookDto);

    return new CreateAuthorBookResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthorBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { authorId } = RecordToInstanceTransformer.strictTransform(request.params, FindAuthorBooksParamDto);

    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindBooksFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const booksDto = await unitOfWork.runInTransaction(async () => {
      const books = await this.authorBookService.findAuthorBooks(unitOfWork, authorId, filters, paginationData);

      return books;
    });

    const responseData = new FindAuthorBooksResponseData(booksDto);

    return new FindAuthorBooksResponseDto(responseData, StatusCodes.OK);
  }

  public async findBookAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { bookId } = RecordToInstanceTransformer.strictTransform(request.params, FindBookAuthorsParamDto);

    const filters = FilterDataParser.parse(request.query.filter as string, findAuthorsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const authorsDto = await unitOfWork.runInTransaction(async () => {
      const authors = await this.authorBookService.findBookAuthors(unitOfWork, bookId, filters, paginationData);

      return authors;
    });

    const responseData = new FindBookAuthorsResponseData(authorsDto);

    return new FindBookAuthorsResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthorBook(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const removeAuthorBookParamDto = RecordToInstanceTransformer.strictTransform(
      request.params,
      RemoveAuthorBookParamDto,
    );

    const removeAuthorBookData = RecordToInstanceTransformer.strictTransform(
      removeAuthorBookParamDto,
      RemoveAuthorBookData,
    );

    await unitOfWork.runInTransaction(async () => {
      await this.authorBookService.removeAuthorBook(unitOfWork, removeAuthorBookData);
    });

    return new RemoveAuthorBookResponseDto(StatusCodes.NO_CONTENT);
  }
}
