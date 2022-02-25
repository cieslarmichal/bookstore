import express, { Request, Response } from 'express';
import { AuthorService } from '../../domain/author/services/authorService';
import { CreateAuthorData, UpdateAuthorData } from '../../domain/author/services/types';
import { RecordToInstanceTransformer, ResponseSender } from '../../shared';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../../shared/http/errors/badRequestError';

const AUTHORS_PATH = '/authors';
const AUTHORS_PATH_WITH_ID = `${AUTHORS_PATH}/:id`;

export class AuthorController {
  public readonly router = express.Router();

  public constructor(private readonly authorService: AuthorService) {
    this.router.post(
      AUTHORS_PATH,
      asyncHandler((request: Request, response: Response) => this.createAuthor(request, response)),
    );
    this.router.get(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.findAuthor(request, response)),
    );
    this.router.patch(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.updateAuthor(request, response)),
    );
    this.router.delete(
      AUTHORS_PATH_WITH_ID,
      asyncHandler((request: Request, response: Response) => this.deleteAuthor(request, response)),
    );
  }

  public async createAuthor(request: Request, response: Response): Promise<void> {
    const createAuthorData = RecordToInstanceTransformer.transform(request.body, CreateAuthorData);

    const authorDto = await this.authorService.createAuthor(createAuthorData);

    ResponseSender.sendJsonDataWithCode(response, authorDto, 201);
  }

  public async findAuthor(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      throw new BadRequestError(`Author id '${request.params.id}' is not a number`);
    }

    const authorDto = await this.authorService.findAuthor(id);

    ResponseSender.sendJsonData(response, authorDto);
  }

  public async updateAuthor(request: Request, response: Response): Promise<void> {
    const updateAuthorData = RecordToInstanceTransformer.transform(request.body, UpdateAuthorData);

    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      throw new BadRequestError(`Author id '${request.params.id}' is not a number`);
    }

    const authorDto = await this.authorService.updateAuthor(id, updateAuthorData);

    ResponseSender.sendJsonData(response, authorDto);
  }

  public async deleteAuthor(request: Request, response: Response): Promise<void> {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      throw new BadRequestError(`Author id '${request.params.id}' is not a number`);
    }

    await this.authorService.removeAuthor(id);

    ResponseSender.sendEmpty(response);
  }
}
