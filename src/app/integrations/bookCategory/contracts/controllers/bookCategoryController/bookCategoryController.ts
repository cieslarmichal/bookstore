import { Request, Response } from 'express';

import { ControllerResponse } from '../../../../controllerResponse';

export interface BookCategoryController {
  createBookCategory(request: Request, response: Response): Promise<ControllerResponse>;
  findBookCategories(request: Request, response: Response): Promise<ControllerResponse>;
  findCategoryBooks(request: Request, response: Response): Promise<ControllerResponse>;
  deleteBookCategory(request: Request, response: Response): Promise<ControllerResponse>;
}
