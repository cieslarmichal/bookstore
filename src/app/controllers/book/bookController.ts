import { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import { Service } from 'typedi';

@Service()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  createBook(req: Request, res: Response): void {
    res.status(201).send(req.body);
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
