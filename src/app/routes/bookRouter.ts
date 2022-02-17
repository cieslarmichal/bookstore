import express, { Request, Response } from 'express';
import { bookController } from '../controllers';

export const router = express.Router({
  strict: true,
});

router.post('/', (req: Request, res: Response) => {
  bookController.createBook(req, res);
});

router.get('/', (req: Request, res: Response) => {
  bookController.findBook(req, res);
});

router.put('/', (req: Request, res: Response) => {
  bookController.updateBook(req, res);
});

router.delete('/', (req: Request, res: Response) => {
  bookController.deleteBook(req, res);
});
