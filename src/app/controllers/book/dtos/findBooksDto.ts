import {
  BETWEEN_FILTER_NAME,
  EQUAL_FILTER_NAME,
  GREATER_THAN_FILTER_NAME,
  GREATER_THAN_OR_EQUAL_FILTER_NAME,
  LESS_THAN_FILTER_NAME,
  LESS_THAN_OR_EQUAL_FILTER_NAME,
  LIKE_FILTER_NAME,
} from '../../../shared';
import { BookDto } from './bookDto';

export const supportedFindBooksFieldsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    title: [EQUAL_FILTER_NAME, LIKE_FILTER_NAME],
    releaseYear: [
      EQUAL_FILTER_NAME,
      LESS_THAN_FILTER_NAME,
      LESS_THAN_OR_EQUAL_FILTER_NAME,
      GREATER_THAN_FILTER_NAME,
      GREATER_THAN_OR_EQUAL_FILTER_NAME,
      BETWEEN_FILTER_NAME,
    ],
    language: [EQUAL_FILTER_NAME],
    format: [EQUAL_FILTER_NAME],
    price: [
      EQUAL_FILTER_NAME,
      LESS_THAN_FILTER_NAME,
      LESS_THAN_OR_EQUAL_FILTER_NAME,
      GREATER_THAN_FILTER_NAME,
      GREATER_THAN_OR_EQUAL_FILTER_NAME,
      BETWEEN_FILTER_NAME,
    ],
  }),
);

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
