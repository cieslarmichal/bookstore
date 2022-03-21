import { IsOptional, Validate } from 'class-validator';
import { FilterHasStringPropertyConstraint, FilterProperty } from '../../shared';
import { CategoryDto } from './categoryDto';

export class FindCategoriesQueryDto {
  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly name?: FilterProperty<string>;
}

export class FindCategoriesResponseData {
  public constructor(public readonly categories: CategoryDto[]) {}
}

export class FindCategoriesResponseDto {
  public constructor(public readonly data: FindCategoriesResponseData, public readonly statusCode: number) {}
}
