import { IsUUID } from 'class-validator';
import { AuthorDto } from '../../author/dtos';

export class FindBookAuthorsParamDto {
  @IsUUID('4')
  public readonly bookId: string;
}

export class FindBookAuthorsResponseData {
  public constructor(public readonly authors: AuthorDto[]) {}
}

export class FindBookAuthorsResponseDto {
  public constructor(public readonly data: FindBookAuthorsResponseData, public readonly statusCode: number) {}
}
