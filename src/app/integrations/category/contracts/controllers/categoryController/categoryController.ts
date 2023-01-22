import { Request, Response } from 'express';

import { ControllerResponse } from '../../../../controllerResponse';

export interface CategoryController {
  createCategory(request: Request, response: Response): Promise<ControllerResponse>;
  findCategory(request: Request, response: Response): Promise<ControllerResponse>;
  findCategories(request: Request, response: Response): Promise<ControllerResponse>;
  deleteCategory(request: Request, response: Response): Promise<ControllerResponse>;
}
