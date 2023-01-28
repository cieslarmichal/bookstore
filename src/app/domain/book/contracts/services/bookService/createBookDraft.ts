import { BookFormat } from '../../bookFormat';
import { BookLanguage } from '../../bookLanguage';

export interface CreateBookDraft {
  readonly title: string;
  readonly releaseYear: number;
  readonly language: BookLanguage;
  readonly format: BookFormat;
  readonly description?: string;
  readonly price: number;
}
