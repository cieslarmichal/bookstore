import { BookDto } from './bookDto';

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
