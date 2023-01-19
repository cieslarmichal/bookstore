import express, { NextFunction, Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { RecordToInstanceTransformer, UnitOfWorkFactory } from '../../common';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authorErrorMiddleware } from './middlewares';
import {
  CreateAuthorBodyDto,
  CreateAuthorResponseData,
  CreateAuthorResponseDto,
  FindAuthorParamDto,
  FindAuthorResponseData,
  FindAuthorResponseDto,
  RemoveAuthorParamDto,
  RemoveAuthorResponseDto,
  UpdateAuthorBodyDto,
  UpdateAuthorParamDto,
  UpdateAuthorResponseData,
  UpdateAuthorResponseDto,
} from './dtos';
import { ControllerResponse } from '../controllerResponse';
import { AuthMiddleware, FilterDataParser, PaginationDataParser, sendResponseMiddleware } from '../common';
import {
  FindAuthorsResponseData,
  FindAuthorsResponseDto,
  supportedFindAuthorsFieldsFilters,
} from './dtos/findAuthorsDto';

const AUTHORS_PATH = '/authors';
const AUTHORS_PATH_WITH_ID = `${AUTHORS_PATH}/:id`;

export class AuthorController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly authorService: AuthorService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      AUTHORS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const createAuthorResponse = await this.createAuthor(request, response);
        response.locals.controllerResponse = createAuthorResponse;
        next();
      }),
    );
    this.router.get(
      AUTHORS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorResponse = await this.findAuthor(request, response);
        response.locals.controllerResponse = findAuthorResponse;
        next();
      }),
    );
    this.router.get(
      AUTHORS_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findAuthorsResponse = await this.findAuthors(request, response);
        response.locals.controllerResponse = findAuthorsResponse;
        next();
      }),
    );
    this.router.patch(
      AUTHORS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const updateAuthorResponse = await this.updateAuthor(request, response);
        response.locals.controllerResponse = updateAuthorResponse;
        next();
      }),
    );
    this.router.delete(
      AUTHORS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteAuthorResponse = await this.deleteAuthor(request, response);
        response.locals.controllerResponse = deleteAuthorResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(authorErrorMiddleware);
  }

  public async createAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const createAuthorBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateAuthorBodyDto);

    const authorDto = await unitOfWork.runInTransaction(async () => {
      const author = await this.authorService.createAuthor(unitOfWork, createAuthorBodyDto);

      return author;
    });

    const responseData = new CreateAuthorResponseData(authorDto);

    return new CreateAuthorResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindAuthorParamDto);

    const authorDto = await unitOfWork.runInTransaction(async () => {
      const author = await this.authorService.findAuthor(unitOfWork, id);

      return author;
    });

    const responseData = new FindAuthorResponseData(authorDto);

    return new FindAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async findAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindAuthorsFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const authorsDto = await unitOfWork.runInTransaction(async () => {
      const authors = await this.authorService.findAuthors(unitOfWork, filters, paginationData);

      return authors;
    });

    const responseData = new FindAuthorsResponseData(authorsDto);

    return new FindAuthorsResponseDto(responseData, StatusCodes.OK);
  }

  public async updateAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, UpdateAuthorParamDto);

    const updateAuthorBodyDto = RecordToInstanceTransformer.strictTransform(request.body, UpdateAuthorBodyDto);

    const authorDto = await unitOfWork.runInTransaction(async () => {
      const author = await this.authorService.updateAuthor(unitOfWork, id, updateAuthorBodyDto);

      return author;
    });

    const responseData = new UpdateAuthorResponseData(authorDto);

    return new UpdateAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveAuthorParamDto);

    await unitOfWork.runInTransaction(async () => {
      await this.authorService.removeAuthor(unitOfWork, id);
    });

    return new RemoveAuthorResponseDto(StatusCodes.NO_CONTENT);
  }
}
