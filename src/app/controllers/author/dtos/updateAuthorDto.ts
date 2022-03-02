import { IsOptional, IsString, IsUUID } from 'class-validator';
import { AuthorDto } from './authorDto';

export class UpdateAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class UpdateAuthorBodyDto {
  @IsString()
  @IsOptional()
  public readonly about?: string | null;
}

export class UpdateAuthorResponseData {
  public constructor(public readonly author: AuthorDto) {}
}

export class UpdateAuthorResponseDto {
  public constructor(public readonly data: UpdateAuthorResponseData, public readonly statusCode: number) {}
}
