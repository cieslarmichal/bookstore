import { IsUUID } from 'class-validator';
import { CategoryDto } from '../../category/dtos';

export class FindBookCategoriesParamDto {
  @IsUUID('4')
  public readonly bookId: string;
}

export class FindBookCategoriesResponseData {
  public constructor(public readonly categories: CategoryDto[]) {}
}

export class FindBookCategoriesResponseDto {
  public constructor(public readonly data: FindBookCategoriesResponseData, public readonly statusCode: number) {}
}
