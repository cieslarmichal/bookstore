import express, { NextFunction, Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { RecordToInstanceTransformer } from '../../shared';
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
import { ControllerResponse } from '../shared/types/controllerResponse';
import { AuthMiddleware, FilterDataParser, PaginationDataParser, sendResponseMiddleware } from '../shared';
import {
  FindAuthorsResponseData,
  FindAuthorsResponseDto,
  supportedFindAuthorsFieldsFilters,
} from './dtos/findAuthorsDto';

const AUTHORS_PATH = '/authors';
const AUTHORS_PATH_WITH_ID = `${AUTHORS_PATH}/:id`;

export class AuthorController {
  public readonly router = express.Router();

  public constructor(private readonly authorService: AuthorService, authMiddleware: AuthMiddleware) {
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
    const createAuthorBodyDto = RecordToInstanceTransformer.strictTransform(request.body, CreateAuthorBodyDto);

    const authorDto = await this.authorService.createAuthor(createAuthorBodyDto);

    const responseData = new CreateAuthorResponseData(authorDto);

    return new CreateAuthorResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, FindAuthorParamDto);

    const authorDto = await this.authorService.findAuthor(id);

    const responseData = new FindAuthorResponseData(authorDto);

    return new FindAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async findAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const filters = FilterDataParser.parse(request.query.filter as string, supportedFindAuthorsFieldsFilters);

    const paginationData = PaginationDataParser.parse(request.query);

    const authorsDto = await this.authorService.findAuthors(filters, paginationData);

    const responseData = new FindAuthorsResponseData(authorsDto);

    return new FindAuthorsResponseDto(responseData, StatusCodes.OK);
  }

  public async updateAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, UpdateAuthorParamDto);

    const updateAuthorBodyDto = RecordToInstanceTransformer.strictTransform(request.body, UpdateAuthorBodyDto);

    const authorDto = await this.authorService.updateAuthor(id, updateAuthorBodyDto);

    const responseData = new UpdateAuthorResponseData(authorDto);

    return new UpdateAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.strictTransform(request.params, RemoveAuthorParamDto);

    await this.authorService.removeAuthor(id);

    return new RemoveAuthorResponseDto(StatusCodes.NO_CONTENT);
  }
}
