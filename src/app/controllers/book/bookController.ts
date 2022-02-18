import express, { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import {
  CreateBookData,
  UpdateBookData,
} from 'src/app/domain/book/services/types';
import { ClassFromRecordValidator } from 'src/app/shared';
import { Service } from 'typedi';

@Service()
export class BookController {
  public path = '/books';
  public router = express.Router();

  public constructor(private readonly bookService: BookService) {
    this.router.post(this.path, this.createBook);
    this.router.get(this.path, this.findBook);
    this.router.put(this.path, this.updateBook);
    this.router.delete(this.path, this.deleteBook);
  }

  public createBook(request: Request, response: Response): void {
    const createBookData = ClassFromRecordValidator.validateDto(
      CreateBookData,
      request.body,
    );

    const bookDto = this.bookService.createBook(createBookData);

    response.status(201).send(bookDto);
  }

  public findBook(request: Request, response: Response): void {
    const id = request.params.id;

    const bookDto = this.bookService.findBook(id);

    response.send(bookDto);
  }

  public updateBook(request: Request, response: Response): void {
    const updateBookData = ClassFromRecordValidator.validateDto(
      UpdateBookData,
      request.body,
    );

    const id = request.params.id;

    const bookDto = this.bookService.updateBook(id, updateBookData);

    response.send(bookDto);
  }

  public deleteBook(request: Request, response: Response): void {
    const id = request.params.id;

    this.bookService.removeBook(id);

    response.send();
  }
}
