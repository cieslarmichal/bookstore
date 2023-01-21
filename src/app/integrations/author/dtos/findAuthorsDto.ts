import { EQUAL_FILTER_NAME, LIKE_FILTER_NAME } from '../../../common';
import { AuthorDto } from './authorDto';

export const supportedFindAuthorsFieldsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    firstName: [EQUAL_FILTER_NAME, LIKE_FILTER_NAME],
    lastName: [EQUAL_FILTER_NAME, LIKE_FILTER_NAME],
  }),
);

export class FindAuthorsResponseData {
  public constructor(public readonly authors: AuthorDto[]) {}
}

export class FindAuthorsResponseDto {
  public constructor(public readonly data: FindAuthorsResponseData, public readonly statusCode: number) {}
}
