import {
  BETWEEN_OPERATION_NAME,
  EQUAL_OPERATION_NAME,
  GREATER_THAN_OPERATION_NAME,
  GREATER_THAN_OR_EQUAL_OPERATION_NAME,
  LESS_THAN_OPERATION_NAME,
  LESS_THAN_OR_EQUAL_OPERATION_NAME,
  LIKE_OPERATION_NAME,
} from '../../shared/filter';
import { BookDto } from './bookDto';

export const supportedFindBooksFieldsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    title: [EQUAL_OPERATION_NAME, LIKE_OPERATION_NAME],
    releaseYear: [
      EQUAL_OPERATION_NAME,
      LESS_THAN_OPERATION_NAME,
      LESS_THAN_OR_EQUAL_OPERATION_NAME,
      GREATER_THAN_OPERATION_NAME,
      GREATER_THAN_OR_EQUAL_OPERATION_NAME,
      BETWEEN_OPERATION_NAME,
    ],
    language: [EQUAL_OPERATION_NAME],
    format: [EQUAL_OPERATION_NAME],
    price: [
      EQUAL_OPERATION_NAME,
      LESS_THAN_OPERATION_NAME,
      LESS_THAN_OR_EQUAL_OPERATION_NAME,
      GREATER_THAN_OPERATION_NAME,
      GREATER_THAN_OR_EQUAL_OPERATION_NAME,
      BETWEEN_OPERATION_NAME,
    ],
  }),
);

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
