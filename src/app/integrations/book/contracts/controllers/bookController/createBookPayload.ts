import { BookFormat } from '../../../../../domain/book/contracts/bookFormat';
import { BookLanguage } from '../../../../../domain/book/contracts/bookLanguage';

export interface CreateBookPayload {
  readonly title: string;
  readonly releaseYear: number;
  readonly language: BookLanguage;
  readonly format: BookFormat;
  readonly description?: string;
  readonly price: number;
}
