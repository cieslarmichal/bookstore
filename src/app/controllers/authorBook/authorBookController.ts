import express, { NextFunction, Request, Response } from 'express';
import { AuthorBookService } from '../../domain/authorBook/services/authorBookService';
import { CreateAuthorBookData, RemoveAuthorBookData } from '../../domain/authorBook/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authorBookErrorMiddleware } from './middlewares';
import {
  CreateAuthorBookParamDto,
  CreateAuthorBookResponseData,
  CreateAuthorBookResponseDto,
  RemoveAuthorBookParamDto,
  RemoveAuthorBookResponseDto,
} from './dtos';
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, sendResponseMiddleware } from '../shared';
import {
  FindAuthorBooksParamDto,
  FindAuthorBooksResponseData,
  FindAuthorBooksResponseDto,
} from './dtos/findAuthorBooksDto';
import {
  FindBookAuthorsParamDto,
  FindBookAuthorsResponseData,
  FindBookAuthorsResponseDto,
} from './dtos/findBookAuthorsDto';

const AUTHOR_BOOKS_PATH = '/authors/:authorId/books';
const AUTHOR_BOOKS_PATH_WITH_ID = `${AUTHOR_BOOKS_PATH}/:bookId`;
const BOOK_AUTHORS_PATH = '/books/:bookId/authors';

export class AuthorBookController {
  public readonly router = express.Router();

  public constructor(private readonly authorBookService: AuthorBookService, authMiddleware: AuthMiddleware) {
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
    const createAuthorBookParamDto = RecordToInstanceTransformer.transform(request.params, CreateAuthorBookParamDto);

    const createAuthorBookData = RecordToInstanceTransformer.transform(createAuthorBookParamDto, CreateAuthorBookData);

    const authorBookDto = await this.authorBookService.createAuthorBook(createAuthorBookData);

    const responseData = new CreateAuthorBookResponseData(authorBookDto);

    return new CreateAuthorBookResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthorBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const { authorId } = RecordToInstanceTransformer.transform(request.params, FindAuthorBooksParamDto);

    const authorBookDto = await this.authorBookService.findAuthorBooks(authorId);

    const responseData = new FindAuthorBooksResponseData(authorBookDto);

    return new FindAuthorBooksResponseDto(responseData, StatusCodes.OK);
  }

  public async findBookAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const { bookId } = RecordToInstanceTransformer.transform(request.params, FindBookAuthorsParamDto);

    const authorBookDto = await this.authorBookService.findBookAuthors(bookId);

    const responseData = new FindBookAuthorsResponseData(authorBookDto);

    return new FindBookAuthorsResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthorBook(request: Request, response: Response): Promise<ControllerResponse> {
    const removeAuthorBookParamDto = RecordToInstanceTransformer.transform(request.params, RemoveAuthorBookParamDto);

    const removeAuthorBookData = RecordToInstanceTransformer.transform(removeAuthorBookParamDto, RemoveAuthorBookData);

    await this.authorBookService.removeAuthorBook(removeAuthorBookData);

    return new RemoveAuthorBookResponseDto(StatusCodes.NO_CONTENT);
  }
}
