import express, { Request, Response } from 'express';
import { bookController } from '../../controllers/book';

export const router = express.Router({
  strict: true,
});

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
