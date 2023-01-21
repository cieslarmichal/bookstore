import { Request, Response } from 'express';
import { ControllerResponse } from '../../../../controllerResponse';

export interface AuthorBookController {
  createAuthorBook(request: Request, response: Response): Promise<ControllerResponse>;
  findAuthorBooks(request: Request, response: Response): Promise<ControllerResponse>;
  findBookAuthors(request: Request, response: Response): Promise<ControllerResponse>;
  deleteAuthorBook(request: Request, response: Response): Promise<ControllerResponse>;
}
