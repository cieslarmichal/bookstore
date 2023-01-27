import { BookFormat } from '../../bookFormat';
import { BookLanguage } from '../../bookLanguage';

export interface CreateOnePayload {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly language: BookLanguage;
  readonly format: BookFormat;
  readonly description?: string | null;
  readonly price: number;
}
