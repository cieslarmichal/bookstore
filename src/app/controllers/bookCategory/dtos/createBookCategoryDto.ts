import { IsUUID } from 'class-validator';
import { BookCategoryDto } from './bookCategoryDto';

export class CreateBookCategoryParamDto {
  @IsUUID('4')
  public readonly bookId: string;

  @IsUUID('4')
  public readonly categoryId: string;
}

export class CreateBookCategoryResponseData {
  public constructor(public readonly bookCategory: BookCategoryDto) {}
}

export class CreateBookCategoryResponseDto {
  public constructor(public readonly data: CreateBookCategoryResponseData, public readonly statusCode: number) {}
}
