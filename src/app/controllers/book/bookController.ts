import { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import { Service } from 'typedi';
import { BookRequestValidator } from './bookRequestValidator';

@Service()
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly bookRequestValidator: BookRequestValidator,
  ) {}

  createBook(req: Request, res: Response): void {
    this.bookService.createBook(req.body);
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
