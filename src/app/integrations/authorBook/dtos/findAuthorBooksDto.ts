import { IsUUID } from 'class-validator';
import { BookDto } from '../../book/dtos';

export class FindAuthorBooksParamDto {
  @IsUUID('4')
  public readonly authorId: string;
}

export class FindAuthorBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindAuthorBooksResponseDto {
  public constructor(public readonly data: FindAuthorBooksResponseData, public readonly statusCode: number) {}
}
