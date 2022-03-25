import { EQUAL_FILTER_NAME, LIKE_FILTER_NAME } from '../../../shared';
import { CategoryDto } from './categoryDto';

export const supportedFindCategoriesFieldsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    name: [EQUAL_FILTER_NAME, LIKE_FILTER_NAME],
  }),
);

export class FindCategoriesResponseData {
  public constructor(public readonly categories: CategoryDto[]) {}
}

export class FindCategoriesResponseDto {
  public constructor(public readonly data: FindCategoriesResponseData, public readonly statusCode: number) {}
}
