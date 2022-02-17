import express, { Request, Response } from 'express';
import { BookService } from 'src/app/domain/book/services/bookService';
import { Service } from 'typedi';
import { BookRequestValidator } from './bookRequestValidator';

@Service()
export class BookController {
  public path = '/books';
  public router = express.Router();

  constructor(
    private readonly bookService: BookService,
    private readonly bookRequestValidator: BookRequestValidator,
  ) {
    this.router.post(this.path, this.createBook);
    this.router.get(this.path, this.findBook);
    this.router.put(this.path, this.updateBook);
    this.router.delete(this.path, this.deleteBook);
  }

  createBook(request: Request, response: Response): void {
    const validationError =
      this.bookRequestValidator.checkForValidationErrorInCreateBookRequest(
        request,
      );

    if (validationError) {
      response.status(400).send(validationError);
      return;
    }

    const bookDto = this.bookService.createBook(request.body);

    response.status(201).send(bookDto);
  }

  findBook(request: Request, response: Response): void {
    const id = request.params.id;

    const bookDto = this.bookService.findBook(id);

    response.send(bookDto);
  }

  updateBook(request: Request, response: Response): void {
    const validationError =
      this.bookRequestValidator.checkForValidationErrorInUpdateBookRequest(
        request,
      );

    if (validationError) {
      response.status(400).send(validationError);
      return;
    }

    const id = request.params.id;

    const bookDto = this.bookService.updateBook(id, request.body);

    response.send(bookDto);
  }

  deleteBook(request: Request, response: Response): void {
    const id = request.params.id;

    this.bookService.removeBook(id);

    response.send();
  }
}
