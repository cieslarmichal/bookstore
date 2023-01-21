import { Request, Response } from 'express';
import { ControllerResponse } from '../../../../controllerResponse';

export interface AddressController {
  createAddress(request: Request, response: Response): Promise<ControllerResponse>;
  findAddress(request: Request, response: Response): Promise<ControllerResponse>;
  findAddresses(request: Request, response: Response): Promise<ControllerResponse>;
  deleteAddress(request: Request, response: Response): Promise<ControllerResponse>;
}
