import { IsOptional, IsString } from 'class-validator';
import { AuthorDto } from './authorDto';

export class CreateAuthorBodyDto {
  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

  @IsString()
  @IsOptional()
  public readonly about?: string | null;
}

export class CreateAuthorResponseData {
  public constructor(public readonly author: AuthorDto) {}
}

export class CreateAuthorResponseDto {
  public constructor(public readonly data: CreateAuthorResponseData, public readonly statusCode: number) {}
}
