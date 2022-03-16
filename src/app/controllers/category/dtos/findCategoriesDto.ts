import { IsOptional, IsString } from 'class-validator';
import { CategoryDto } from './categoryDto';

export class FindCategoriesQueryDto {
  @IsOptional()
  @IsString()
  public readonly name?: string;
}

export class FindCategoriesResponseData {
  public constructor(public readonly categories: CategoryDto[]) {}
}

export class FindCategoriesResponseDto {
  public constructor(public readonly data: FindCategoriesResponseData, public readonly statusCode: number) {}
}
