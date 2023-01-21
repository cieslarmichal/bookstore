import { IsUUID } from 'class-validator';
import { BookDto } from '../../book/dtos';

export class FindCategoryBooksParamDto {
  @IsUUID('4')
  public readonly categoryId: string;
}

export class FindCategoryBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindCategoryBooksResponseDto {
  public constructor(public readonly data: FindCategoryBooksResponseData, public readonly statusCode: number) {}
}
