import { AuthorDto } from './authorDto';

export class FindAuthorsResponseData {
  public constructor(public readonly authors: AuthorDto[]) {}
}

export class FindAuthorsResponseDto {
  public constructor(public readonly data: FindAuthorsResponseData, public readonly statusCode: number) {}
}
