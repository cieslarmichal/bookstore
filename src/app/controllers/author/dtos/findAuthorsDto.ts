import { IsOptional, IsString } from 'class-validator';
import { AuthorDto } from './authorDto';

export class FindAuthorsQueryDto {
  @IsOptional()
  @IsString()
  public readonly firstName?: string;

  @IsOptional()
  @IsString()
  public readonly lastName?: string;
}

export class FindAuthorsResponseData {
  public constructor(public readonly authors: AuthorDto[]) {}
}

export class FindAuthorsResponseDto {
  public constructor(public readonly data: FindAuthorsResponseData, public readonly statusCode: number) {}
}
