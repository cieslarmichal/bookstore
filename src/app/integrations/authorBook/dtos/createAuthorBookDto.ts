import { IsUUID } from 'class-validator';
import { AuthorBookDto } from './authorBookDto';

export class CreateAuthorBookParamDto {
  @IsUUID('4')
  public readonly authorId: string;

  @IsUUID('4')
  public readonly bookId: string;
}

export class CreateAuthorBookResponseData {
  public constructor(public readonly authorBook: AuthorBookDto) {}
}

export class CreateAuthorBookResponseDto {
  public constructor(public readonly data: CreateAuthorBookResponseData, public readonly statusCode: number) {}
}
