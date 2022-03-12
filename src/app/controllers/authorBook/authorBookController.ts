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
import { FindAuthorBooksParamDto } from './dtos/findAuthorBooksDto';

const AUTHOR_BOOKS_PATH = '/authors/:authorId/books';
const AUTHOR_BOOKS_PATH_WITH_ID = `${AUTHOR_BOOKS_PATH}/:bookId`;
const BOOK_AUTHORS_PATH = '/books/:bookId/authors';

export class AuthorBookController {
  public readonly router = express.Router();

  public constructor(private readonly authorBookService: AuthorBookService, authMiddleware: AuthMiddleware) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      AUTHOR_BOOKS_PATH,
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
    const createAuthorBookBodyDto = RecordToInstanceTransformer.transform(request.params, CreateAuthorBookParamDto);

    const createAuthorBookData = RecordToInstanceTransformer.transform(createAuthorBookBodyDto, CreateAuthorBookData);

    const authorBookDto = await this.authorBookService.createAuthorBook(createAuthorBookData);

    const responseData = new CreateAuthorBookResponseData(authorBookDto);

    return new CreateAuthorBookResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthorBooks(request: Request, response: Response): Promise<ControllerResponse> {
    const findAuthorBooksParamDto = RecordToInstanceTransformer.transform(request.params, FindAuthorBooksParamDto);

    const authorBookDto = await this.authorBookService.findAuthorBook(id);

    const responseData = new FindAuthorBookResponseData(authorBookDto);

    return new FindAuthorBookResponseDto(responseData, StatusCodes.OK);
  }

  public async findBookAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, FindAuthorBookParamDto);

    const authorBookDto = await this.authorBookService.findAuthorBook(id);

    const responseData = new FindAuthorBookResponseData(authorBookDto);

    return new FindAuthorBookResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthorBook(request: Request, response: Response): Promise<ControllerResponse> {
    const removeAuthorBookBodyDto = RecordToInstanceTransformer.transform(request.params, RemoveAuthorBookParamDto);

    const removeAuthorBookData = RecordToInstanceTransformer.transform(removeAuthorBookBodyDto, RemoveAuthorBookData);

    await this.authorBookService.removeAuthorBook(removeAuthorBookData);

    return new RemoveAuthorBookResponseDto(StatusCodes.NO_CONTENT);
  }
}
