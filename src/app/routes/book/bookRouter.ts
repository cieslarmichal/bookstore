import express, { Request, Response } from 'express';
import Container from 'typedi';
import { BookController } from '../../controllers/book';

export const router = express.Router({
  strict: true,
});

const bookController = Container.get(BookController);

router.post('/', (req: Request, res: Response) => {
  bookController.createBook(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  bookController.findBook(req, res);
});

router.put('/:id', (req: Request, res: Response) => {
  bookController.updateBook(req, res);
});

router.delete('/:id', (req: Request, res: Response) => {
  bookController.deleteBook(req, res);
});
