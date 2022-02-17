import { Request, Response } from 'express';

export class BookController {
  createBook(req: Request, res: Response): void {
    console.log(req.body);
  }

  findBook(req: Request, res: Response): void {
    console.log(req.body);
  }

  updateBook(req: Request, res: Response): void {
    console.log(req.body);
  }

  deleteBook(req: Request, res: Response): void {
    console.log(req.body);
  }
}
