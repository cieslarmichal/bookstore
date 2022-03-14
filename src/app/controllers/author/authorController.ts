import express, { NextFunction, Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { CreateAuthorData, UpdateAuthorData } from '../../domain/author/services/types';
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
import { AuthMiddleware, sendResponseMiddleware } from '../shared';
import { FindAuthorsResponseData, FindAuthorsResponseDto } from './dtos/findAuthorsDto';

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
    const createAuthorBodyDto = RecordToInstanceTransformer.transform(request.body, CreateAuthorBodyDto);

    const createAuthorData = RecordToInstanceTransformer.transform(createAuthorBodyDto, CreateAuthorData);

    const authorDto = await this.authorService.createAuthor(createAuthorData);

    const responseData = new CreateAuthorResponseData(authorDto);

    return new CreateAuthorResponseDto(responseData, StatusCodes.CREATED);
  }

  public async findAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, FindAuthorParamDto);

    const authorDto = await this.authorService.findAuthor(id);

    const responseData = new FindAuthorResponseData(authorDto);

    return new FindAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async findAuthors(request: Request, response: Response): Promise<ControllerResponse> {
    const authorsDto = await this.authorService.findAuthors();

    const responseData = new FindAuthorsResponseData(authorsDto);

    return new FindAuthorsResponseDto(responseData, StatusCodes.OK);
  }

  public async updateAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, UpdateAuthorParamDto);

    const updateAuthorBodyDto = RecordToInstanceTransformer.transform(request.body, UpdateAuthorBodyDto);

    const updateAuthorData = RecordToInstanceTransformer.transform(updateAuthorBodyDto, UpdateAuthorData);

    const authorDto = await this.authorService.updateAuthor(id, updateAuthorData);

    const responseData = new UpdateAuthorResponseData(authorDto);

    return new UpdateAuthorResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteAuthor(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, RemoveAuthorParamDto);

    await this.authorService.removeAuthor(id);

    return new RemoveAuthorResponseDto(StatusCodes.NO_CONTENT);
  }
}
